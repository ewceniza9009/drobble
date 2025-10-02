using Drobble.Payment.Application.Consumers;
using Drobble.Payment.Application.Contracts;
using Drobble.Payment.Application.Features;
using Drobble.Payment.Infrastructure.Persistence;
using Drobble.Payment.Infrastructure.Services;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Define CORS Policy ---
var AllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowSpecificOrigins,
      policy =>
      {
          policy.WithOrigins("http://localhost:5173") // Allow your React app
                .AllowAnyHeader()
                .AllowAnyMethod();
      });
});


// --- Service Registration ---

// 1. Database Context
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection"),
    // Explicitly tell EF Core where to find the migrations
    npgsqlOptions => npgsqlOptions.MigrationsAssembly("Drobble.Payment.Infrastructure")));

// 2. Repositories and Services
builder.Services.AddHttpContextAccessor(); // Add HttpContextAccessor
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IPaymentGatewayService, PayPalService>();
builder.Services.AddHttpClient<IOrderService, OrderService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:OrderManagementApi"]!);
});

// 3. MediatR for CQRS
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreatePaymentOrderCommand).Assembly));

// 4. MassTransit for RabbitMQ
builder.Services.AddMassTransit(busConfig => {
    busConfig.AddConsumer<OrderCreatedConsumer>();
    busConfig.UsingRabbitMq((context, cfg) => {
        cfg.Host(builder.Configuration["RabbitMQ:Host"], "/", h => {
            h.Username("guest");
            h.Password("guest");
        });
        cfg.ConfigureEndpoints(context);
    });
});

// 5. Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key is not configured.");
}
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();


// 6. API Controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Drobble Payment API", Version = "v1" });
});


var app = builder.Build();

// --- HTTP Pipeline Configuration ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Auto-run migrations on startup in development
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
        dbContext.Database.Migrate();
    }
}

// **REMOVED** app.UseHttpsRedirection(); to prevent issues behind the gateway
app.UseCors(AllowSpecificOrigins); // **ADDED** Use the CORS policy

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();


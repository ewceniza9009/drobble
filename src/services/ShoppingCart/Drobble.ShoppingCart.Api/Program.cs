// ---- File: src/services/ShoppingCart/Api/Program.cs ----
using Drobble.ShoppingCart.Application.Consumers;
using Drobble.ShoppingCart.Application.Contracts;
using Drobble.ShoppingCart.Application.Features.Carts.Commands;
using Drobble.ShoppingCart.Infrastructure.Persistence;
using Drobble.ShoppingCart.Infrastructure.Services;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

MongoDbPersistence.Configure();

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container.
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<MongoDbSettings>>().Value);

builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddHttpClient<IProductCatalogService, ProductCatalogService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:ProductCatalogApi"]!);
});
builder.Services.AddHttpContextAccessor();
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(AddItemToCartCommand).Assembly));

builder.Services.AddMassTransit(busConfig => {
    busConfig.AddConsumer<OrderCreatedConsumer>();

    busConfig.UsingRabbitMq((context, cfg) => {
        cfg.Host(builder.Configuration["RabbitMQ:Host"], "/", h => {
            h.Username("guest");
            h.Password("guest");
        });
        // This automatically sets up the endpoint for the consumer
        cfg.ConfigureEndpoints(context);
    });
});

// Add Authentication and Authorization
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 2. Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Add Authentication and Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
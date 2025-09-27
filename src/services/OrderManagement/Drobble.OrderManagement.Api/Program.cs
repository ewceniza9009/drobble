// ---- File: src/services/OrderManagement/Drobble.OrderManagement.Api/Program.cs ----
using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Application.Features.Orders.Commands;
using Drobble.OrderManagement.Infrastructure.Persistence;
using Drobble.OrderManagement.Infrastructure.Services;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims; // ADDED for ClaimTypes

// Ensure this is at the very top to prevent default mapping confusion globally
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<OrderDbContext>(options =>
  options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddHttpClient<IProductCatalogService, ProductCatalogService>(client => {
    client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:ProductCatalogApi"]!);
});

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateOrderCommand).Assembly));

builder.Services.AddMassTransit(busConfig => {
    busConfig.UsingRabbitMq((context, cfg) => {
        cfg.Host(builder.Configuration["RabbitMQ:Host"], "/", h => {
            h.Username("guest");
            h.Password("guest");
        });
    });
});

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
          IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),

          // FIX: Explicitly use the ClaimTypes.Role constant for role mapping
          RoleClaimType = ClaimTypes.Role
      };
  });

builder.Services.AddAuthorization(options => {
    // FIX: Policies already use RequireRole, ensuring compatibility
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("VendorOnly", policy => policy.RequireRole("Vendor", "Admin"));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement {
    { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, new string[]{} }
  });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();

// 👇 DEBUG MIDDLEWARE: Log user claims and roles before authorization
app.Use(async (context, next) =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

        // FIX: Use ClaimTypes constants for accurately checking UserId and Role
        var userId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        var role = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

        logger.LogInformation("DEBUG_AUTH (ORDER MANAGEMENT): User '{UserId}' authenticated. Role claim found: '{Role}'", userId ?? "NULL", role ?? "NONE");

        // Log all claims for comprehensive debugging
        foreach (var claim in context.User.Claims)
        {
            logger.LogInformation("DEBUG_AUTH (ORDER MANAGEMENT): Claim Type: {Type}, Value: {Value}", claim.Type, claim.Value);
        }
    }
    await next();
});
// 👆 END DEBUG MIDDLEWARE

app.UseAuthorization();
app.MapControllers();

app.Run();
// ---- File: src/services/Promotions/Drobble.Promotions.Api/Program.cs ----
using Drobble.Promotions.Application.Contracts;
using Drobble.Promotions.Application.Features.Promotions.Commands;
using Drobble.Promotions.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql; // 1. Ensure this is imported
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// ======================= THIS IS THE FIX: START =======================
// Create a data source builder from your connection string.
var dataSourceBuilder = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("PostgresConnection"));

// This line explicitly tells the database driver it's allowed to serialize your custom objects (like PromotionRule) to JSON.
dataSourceBuilder.EnableDynamicJson();

var dataSource = dataSourceBuilder.Build();

// Tell Entity Framework to use this newly configured data source for its database connection.
builder.Services.AddDbContext<PromotionsDbContext>(options =>
    options.UseNpgsql(dataSource));
// ======================= THIS IS THE FIX: END =========================


builder.Services.AddScoped<IPromotionRepository, PromotionRepository>();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreatePromotionCommand).Assembly));

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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // This tells the API to convert strings from JSON into C# enums
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

// 👇 DEBUG MIDDLEWARE: Log user claims and roles before authorization
app.Use(async (context, next) =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

        var userId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        var role = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

        logger.LogInformation("DEBUG_AUTH (PROMOTIONS): User '{UserId}' authenticated. Role claim found: '{Role}'", userId ?? "NULL", role ?? "NONE");

        foreach (var claim in context.User.Claims)
        {
            logger.LogInformation("DEBUG_AUTH (PROMOTIONS): Claim Type: {Type}, Value: {Value}", claim.Type, claim.Value);
        }
    }
    await next();
});
// 👆 END DEBUG MIDDLEWARE

app.MapControllers();

app.Run();
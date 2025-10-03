using Drobble.ReviewsRatings.Application.Contracts;
using Drobble.ReviewsRatings.Application.Features.Reviews.Commands;
using Drobble.ReviewsRatings.Infrastructure.Persistence;
using Drobble.ReviewsRatings.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;    
using System.Text;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
MongoDbPersistence.Configure();

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<IReviewRepository, ReviewRepository>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddHttpClient<IProductCatalogService, ProductCatalogService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:ProductCatalogApi"]!);
});

builder.Services.AddMediatR(cfg =>
 cfg.RegisterServicesFromAssembly(typeof(CreateReviewCommand).Assembly));

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
    options.AddPolicy("VendorOnly", policy => policy.RequireRole("Vendor", "Admin"));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
 {
  {
   new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
   new string[]{}
  }
 });
});

builder.Services.AddHttpClient<IUserManagementService, UserManagementService>(client => {
    client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:UserManagementApi"]!);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();

app.Use(async (context, next) =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

        var userId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        var role = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

        logger.LogInformation("DEBUG_AUTH (REVIEWS): User '{UserId}' authenticated. Role claim found: '{Role}'", userId ?? "NULL", role ?? "NONE");

        foreach (var claim in context.User.Claims)
        {
            logger.LogInformation("DEBUG_AUTH (REVIEWS): Claim Type: {Type}, Value: {Value}", claim.Type, claim.Value);
        }
    }
    await next();
});
app.UseAuthorization();
app.MapControllers();
app.Run();
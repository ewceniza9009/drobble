using Drobble.ProductCatalog.Application.Consumers;
using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Application.Features.Products.Commands;
using Drobble.ProductCatalog.Infrastructure.Persistence;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using Drobble.ProductCatalog.Domain.Entities;
using System.Text.Json;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

MongoDbPersistence.Configure();

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateProductCommand).Assembly));

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

            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization(options => {
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("VendorOnly", policy => policy.RequireRole("Vendor", "Admin"));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
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

    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var productRepository = services.GetRequiredService<IProductRepository>();
        if (!await productRepository.HasCategoriesAsync())
        {
            logger.LogInformation("Seeding categories into the database...");
            var categoryData = await File.ReadAllTextAsync("categories.seed.json");
            
            var categoriesToSeed = JsonSerializer.Deserialize<List<CategorySeedDto>>(categoryData);

            if (categoriesToSeed is not null)
            {
                var parentCategory = categoriesToSeed.First(c => c.Name == "Home & Kitchen");
                var parentEntity = new Category { Name = parentCategory.Name, Description = parentCategory.Description, Slug = parentCategory.Slug };
                await productRepository.AddCategoryAsync(parentEntity);

                foreach (var catDto in categoriesToSeed)
                {
                    if (catDto.ParentId == "INJECT_PARENT_ID")
                    {
                        var category = new Category
                        {
                            Name = catDto.Name,
                            Description = catDto.Description,
                            Slug = catDto.Slug,
                            ParentId = parentEntity.Id     
                        };
                        await productRepository.AddCategoryAsync(category);
                    }
                    else if (catDto.ParentId is null && catDto.Name != parentCategory.Name)
                    {
                         var category = new Category
                        {
                            Name = catDto.Name,
                            Description = catDto.Description,
                            Slug = catDto.Slug
                        };
                        await productRepository.AddCategoryAsync(category);
                    }
                }
            }
            logger.LogInformation("Database seeding completed.");
        }
        else
        {
            logger.LogInformation("Categories already exist. Skipping seed.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database seeding.");
    }
}
app.UseAuthentication();

app.Use(async (context, next) =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

        var userId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        var role = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

        logger.LogInformation("DEBUG_AUTH (FIXED): User '{UserId}' authenticated. Role claim found: '{Role}'", userId ?? "NULL", role ?? "NONE");

        foreach (var claim in context.User.Claims)
        {
            logger.LogInformation("DEBUG_AUTH (FIXED): Claim Type: {Type}, Value: {Value}", claim.Type, claim.Value);
        }
    }
    await next();
});
app.UseAuthorization();
app.MapControllers();

app.Run();
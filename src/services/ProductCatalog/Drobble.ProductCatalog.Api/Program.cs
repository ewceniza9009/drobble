using Drobble.ProductCatalog.Application.Consumers;
using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Application.Features.Products.Commands;
using Drobble.ProductCatalog.Infrastructure.Persistence;
using Drobble.ProductCatalog.Domain.Entities;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using MongoDB.Bson;
using MongoDB.Bson.Serialization; // Required for BSON deserialization

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
MongoDbPersistence.Configure();

var builder = WebApplication.CreateBuilder(args);

// --- Service Registrations ---
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

// --- Seeding Logic and Middleware Pipeline ---
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

        // SEED CATEGORIES from MongoDB Extended JSON format
        if (!await productRepository.HasCategoriesAsync())
        {
            logger.LogInformation("Seeding categories from BSON file...");
            var categoryData = await File.ReadAllTextAsync("Data/DrobbleProductCatalog.categorys.json");

            var categoryDocs = BsonSerializer.Deserialize<List<BsonDocument>>(categoryData);

            foreach (var doc in categoryDocs)
            {
                var category = new Category
                {
                    Name = doc["Name"].AsString,
                    Slug = doc["Slug"].AsString,
                    Description = doc["Description"].AsString,
                    ParentId = doc["ParentId"].IsBsonNull ? ObjectId.Empty : doc["ParentId"].AsObjectId
                };

                if (doc.Contains("UpdatedAt"))
                {
                    category.UpdatedAt = doc["UpdatedAt"].ToUniversalTime();
                }

                await productRepository.AddCategoryAsync(category);
            }
            logger.LogInformation("Category seeding completed.");
        }
        else
        {
            logger.LogInformation("Categories already exist. Skipping seed.");
        }

        // SEED PRODUCTS from MongoDB Extended JSON format
        if (!await productRepository.HasProductsAsync())
        {
            logger.LogInformation("Seeding products from BSON file...");
            var productData = await File.ReadAllTextAsync("Data/DrobbleProductCatalog.products.json");

            var productDocs = BsonSerializer.Deserialize<List<BsonDocument>>(productData);

            foreach (var doc in productDocs)
            {
                var product = new Product
                {
                    Name = doc["Name"].AsString,
                    Description = doc["Description"].AsString,
                    Price = doc["Price"].ToDecimal(),
                    Stock = doc["Stock"].AsInt32,
                    CategoryId = doc["CategoryId"].AsObjectId,
                    VendorId = doc["VendorId"].IsBsonNull ? null : doc["VendorId"].AsGuid,
                    ImageUrls = doc["ImageUrls"].AsBsonArray.Select(url => url.AsString).ToList(),
                    IsActive = doc["IsActive"].AsBoolean,
                    IsFeatured = doc["IsFeatured"].AsBoolean,
                    Sku = doc.Contains("Sku") && !doc["Sku"].IsBsonNull ? doc["Sku"].AsString : null,
                    Weight = doc.Contains("Weight") && !doc["Weight"].IsBsonNull ? doc["Weight"].ToDecimal() : 0
                };

                if (doc.Contains("UpdatedAt"))
                {
                    product.UpdatedAt = doc["UpdatedAt"].ToUniversalTime();
                }

                await productRepository.AddAsync(product);
            }
            logger.LogInformation("Product seeding completed.");
        }
        else
        {
            logger.LogInformation("Products already exist. Skipping seed.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database seeding.");
    }
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
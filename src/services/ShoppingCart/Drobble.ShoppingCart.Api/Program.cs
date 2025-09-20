using Drobble.ShoppingCart.Application.Contracts;
using Drobble.ShoppingCart.Application.Features.Carts.Commands;
using Drobble.ShoppingCart.Infrastructure.Persistence;
using Drobble.ShoppingCart.Infrastructure.Services;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container.

// Register MongoDB settings
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<MongoDbSettings>>().Value);

// Register our repository
builder.Services.AddScoped<ICartRepository, CartRepository>();

// Register the inter-service client with HttpClientFactory
builder.Services.AddHttpClient<IProductCatalogService, ProductCatalogService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:ProductCatalogApi"]!);
});

// Register MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(AddItemToCartCommand).Assembly));

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
app.UseAuthorization();
app.MapControllers();

app.Run();
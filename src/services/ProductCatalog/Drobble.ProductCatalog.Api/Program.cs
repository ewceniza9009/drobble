// ---- File: src/services/ProductCatalog/Api/Program.cs ----
using Drobble.ProductCatalog.Application.Consumers;
using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Application.Features.Products.Commands;
using Drobble.ProductCatalog.Infrastructure.Persistence;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Add services to the container ---

builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddScoped<IProductRepository, ProductRepository>();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateProductCommand).Assembly));

// Configure MassTransit with RabbitMQ for consuming events
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


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- 2. Configure the HTTP request pipeline ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
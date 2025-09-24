// ---- File: src/services/SearchDiscovery/Api/Program.cs ----
using Drobble.SearchDiscovery.Application.Consumers;
using Drobble.SearchDiscovery.Application.Features;
using Elastic.Clients.Elasticsearch;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container.
builder.Services.AddSingleton(sp =>
{
    var url = builder.Configuration["Elasticsearch:Url"]!;
    var settings = new ElasticsearchClientSettings(new Uri(url))
        .DefaultIndex("products");
    return new ElasticsearchClient(settings);
});

builder.Services.AddMassTransit(busConfig =>
{
    busConfig.AddConsumer<ProductCreatedConsumer>();
    busConfig.AddConsumer<ProductUpdatedConsumer>();
    busConfig.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMQ:Host"], "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
        cfg.ConfigureEndpoints(context);
    });
});

// Register MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(SearchProductsQuery).Assembly));

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
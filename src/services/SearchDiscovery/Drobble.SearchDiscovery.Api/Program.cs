using Drobble.SearchDiscovery.Application.Consumers;
using Drobble.SearchDiscovery.Application.Features;
using Elastic.Clients.Elasticsearch;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

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
    busConfig.AddConsumer<ProductsReindexConsumer>();      
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

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(SearchProductsQuery).Assembly));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
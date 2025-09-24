// ---- File: src/services/SearchDiscovery/Application/Consumers/ProductCreatedConsumer.cs ----
using Drobble.SearchDiscovery.Domain;
using Drobble.Shared.EventBus.Events;
using Elastic.Clients.Elasticsearch;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace Drobble.SearchDiscovery.Application.Consumers;

public class ProductCreatedConsumer : IConsumer<ProductCreatedEvent>
{
    private readonly ElasticsearchClient _esClient;
    private readonly ILogger<ProductCreatedConsumer> _logger;
    private const string IndexName = "products";

    public ProductCreatedConsumer(ElasticsearchClient esClient, ILogger<ProductCreatedConsumer> logger)
    {
        _esClient = esClient;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ProductCreatedEvent> context)
    {
        _logger.LogInformation("ProductCreatedEvent received for ProductId: {ProductId}", context.Message.Id);

        var productDocument = new ProductDocument
        {
            Id = context.Message.Id,
            Name = context.Message.Name,
            Description = context.Message.Description,
            Price = context.Message.Price,
            ImageUrl = context.Message.ImageUrl
        };

        // ** THE FIX IS HERE **
        // Create an explicit request to remove ambiguity.
        var request = new IndexRequest<ProductDocument>(productDocument, IndexName, productDocument.Id);
        var response = await _esClient.IndexAsync(request);

        if (response.IsValidResponse)
        {
            _logger.LogInformation("Successfully indexed product {ProductId}", productDocument.Id);
        }
        else
        {
            _logger.LogError("Failed to index product {ProductId}. Reason: {Reason}", productDocument.Id, response.ElasticsearchServerError?.Error.Reason);
        }
    }
}
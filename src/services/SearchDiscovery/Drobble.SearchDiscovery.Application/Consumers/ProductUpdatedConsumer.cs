using Drobble.SearchDiscovery.Domain;
using Drobble.Shared.EventBus.Events;
using Elastic.Clients.Elasticsearch;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace Drobble.SearchDiscovery.Application.Consumers;

public class ProductUpdatedConsumer : IConsumer<ProductUpdatedEvent>
{
    private readonly ElasticsearchClient _esClient;
    private readonly ILogger<ProductUpdatedConsumer> _logger;
    private const string IndexName = "products";

    public ProductUpdatedConsumer(ElasticsearchClient esClient, ILogger<ProductUpdatedConsumer> logger)
    {
        _esClient = esClient;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ProductUpdatedEvent> context)
    {
        _logger.LogInformation("ProductUpdatedEvent received for ProductId: {ProductId}", context.Message.Id);

        var productDocument = new ProductDocument
        {
            Id = context.Message.Id,
            Name = context.Message.Name,
            Description = context.Message.Description,
            Price = context.Message.Price,
            ImageUrl = context.Message.ImageUrl
        };

        // Use the UpdateAsync method to perform a partial update on the existing document
        var response = await _esClient.UpdateAsync<ProductDocument, object>(IndexName, productDocument.Id, u => u
            .Doc(productDocument));

        if (response.IsValidResponse)
        {
            _logger.LogInformation("Successfully updated indexed product {ProductId}", productDocument.Id);
        }
        else
        {
            _logger.LogError("Failed to update indexed product {ProductId}. Reason: {Reason}", productDocument.Id, response.ElasticsearchServerError?.Error.Reason);
        }
    }
}
using Drobble.SearchDiscovery.Domain;
using Drobble.Shared.EventBus.Events;
using Elastic.Clients.Elasticsearch;
using MassTransit;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Drobble.SearchDiscovery.Application.Consumers;

public class ProductsReindexConsumer : IConsumer<ProductsReindexRequestedEvent>
{
    private readonly ElasticsearchClient _esClient;
    private readonly ILogger<ProductsReindexConsumer> _logger;
    private const string IndexName = "products";

    public ProductsReindexConsumer(ElasticsearchClient esClient, ILogger<ProductsReindexConsumer> logger)
    {
        _esClient = esClient;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ProductsReindexRequestedEvent> context)
    {
        var productCount = context.Message.Products.Count;
        _logger.LogInformation("ProductsReindexRequestedEvent received with {ProductCount} products. Starting bulk import.", productCount);

        if (productCount == 0)
        {
            _logger.LogWarning("Re-index event received, but no products were included.");
            return;
        }

        // Map the event data to the Elasticsearch document model
        var productDocuments = context.Message.Products.Select(p => new ProductDocument
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            ImageUrl = p.ImageUrl
        });

        // Use the BulkAll helper for efficient, resilient indexing
        var bulkAllObservable = _esClient.BulkAll(productDocuments, b => b
            .Index(IndexName)
            .BackOffTime("30s")
            .BackOffRetries(3)
            .RefreshOnCompleted()
            .MaxDegreeOfParallelism(Environment.ProcessorCount)
            .Size(1000) // Index in batches of 1000
        );

        // Wait for the process to finish and log the outcome
        var waitHandle = new ManualResetEvent(false);
        Exception? exception = null;

        var observer = new BulkAllObserver(
            onNext: response => _logger.LogInformation("Indexed batch of {Count} products.", response.Items.Count),
            onError: ex =>
            {
                exception = ex;
                waitHandle.Set();
            },
            onCompleted: () => waitHandle.Set()
        );

        bulkAllObservable.Subscribe(observer);
        waitHandle.WaitOne();

        if (exception != null)
        {
            _logger.LogError(exception, "An error occurred during the bulk re-indexing process.");
            // Optionally, you can throw the exception to have MassTransit retry the message
            throw new Exception("Bulk re-indexing failed.", exception);
        }

        _logger.LogInformation("Successfully completed re-indexing of {ProductCount} products.", productCount);
    }
}
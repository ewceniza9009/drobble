using Drobble.ProductCatalog.Application.Contracts;
using Drobble.Shared.EventBus.Events;
using MassTransit;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System.Linq;
using System.Threading.Tasks;

namespace Drobble.ProductCatalog.Application.Consumers;

public class OrderCreatedConsumer : IConsumer<OrderCreatedEvent>
{
    private readonly IProductRepository _productRepository;
    private readonly ILogger<OrderCreatedConsumer> _logger;

    public OrderCreatedConsumer(IProductRepository productRepository, ILogger<OrderCreatedConsumer> logger)
    {
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        _logger.LogInformation("OrderCreatedEvent received for OrderId: {OrderId}", context.Message.OrderId);

        var productIds = context.Message.Items.Select(i => ObjectId.Parse(i.ProductId));
        var productsToUpdate = (await _productRepository.GetByIdsAsync(productIds)).ToList();

        if (!productsToUpdate.Any())
        {
            _logger.LogWarning("No products found for OrderId: {OrderId}", context.Message.OrderId);
            return;
        }

        foreach (var item in context.Message.Items)
        {
            var product = productsToUpdate.FirstOrDefault(p => p.Id == ObjectId.Parse(item.ProductId));
            if (product != null)
            {
                // In a real-world scenario, you might have more complex logic,
                // like checking if stock is sufficient before decrementing.
                product.Stock -= item.Quantity;
                await _productRepository.UpdateAsync(product);
                _logger.LogInformation("Decremented stock for ProductId {ProductId} by {Quantity}. New stock: {Stock}",
                    product.Id,
                    item.Quantity,
                    product.Stock);
            }
            else
            {
                _logger.LogWarning("Could not find product with ID {ProductId} to update stock.", item.ProductId);
            }
        }
    }
}
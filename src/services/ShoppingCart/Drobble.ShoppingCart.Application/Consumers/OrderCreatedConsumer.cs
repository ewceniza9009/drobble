using Drobble.Shared.EventBus.Events;
using Drobble.ShoppingCart.Application.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace Drobble.ShoppingCart.Application.Consumers;

/// <summary>
/// Listens for the OrderCreatedEvent and clears the corresponding user's shopping cart.
/// </summary>
public class OrderCreatedConsumer : IConsumer<OrderCreatedEvent>
{
    private readonly ICartRepository _cartRepository;
    private readonly ILogger<OrderCreatedConsumer> _logger;

    public OrderCreatedConsumer(ICartRepository cartRepository, ILogger<OrderCreatedConsumer> logger)
    {
        _cartRepository = cartRepository;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        var userId = context.Message.UserId;
        _logger.LogInformation("OrderCreatedEvent received for UserId: {UserId}. Clearing cart.", userId);

        var userCart = await _cartRepository.GetByUserIdAsync(userId, context.CancellationToken);

        if (userCart != null)
        {
            await _cartRepository.DeleteAsync(userCart.Id, context.CancellationToken);
            _logger.LogInformation("Successfully cleared cart for UserId: {UserId}", userId);
        }
        else
        {
            _logger.LogWarning("No cart found for UserId: {UserId} to clear after order placement.", userId);
        }
    }
}

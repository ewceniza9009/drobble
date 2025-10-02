using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Domain.Entities;
using Drobble.Shared.EventBus.Events;
using MassTransit;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Application.Consumers;

public class PaymentSucceededConsumer : IConsumer<PaymentSucceededEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<PaymentSucceededConsumer> _logger;

    public PaymentSucceededConsumer(IOrderRepository orderRepository, ILogger<PaymentSucceededConsumer> logger)
    {
        _orderRepository = orderRepository;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentSucceededEvent> context)
    {
        _logger.LogInformation("PaymentSucceededEvent received for OrderId: {OrderId}", context.Message.OrderId);

        var order = await _orderRepository.GetByIdAsync(context.Message.OrderId, context.CancellationToken);

        if (order is null)
        {
            _logger.LogWarning("Order with ID {OrderId} not found. Could not update status to Paid.", context.Message.OrderId);
            return;
        }

        // Update the order status
        order.Status = OrderStatus.Paid;
        order.UpdatedAt = System.DateTime.UtcNow;

        await _orderRepository.UpdateAsync(order, context.CancellationToken);

        _logger.LogInformation("Successfully updated status to 'Paid' for OrderId: {OrderId}", context.Message.OrderId);
    }
}

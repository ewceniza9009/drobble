using Drobble.Shared.EventBus.Events;
using MassTransit;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace Drobble.Payment.Application.Consumers;

public class OrderCreatedConsumer : IConsumer<OrderCreatedEvent>
{
    private readonly ILogger<OrderCreatedConsumer> _logger;

    public OrderCreatedConsumer(ILogger<OrderCreatedConsumer> logger)
    {
        _logger = logger;
    }

    public Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        _logger.LogInformation("Received OrderCreatedEvent for OrderId: {OrderId}. Initiating payment for {Currency} {TotalAmount}",
            context.Message.OrderId,
            context.Message.Currency,
            context.Message.TotalAmount);

        return Task.CompletedTask;
    }
}
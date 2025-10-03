using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Domain.Entities;
using Drobble.Shared.EventBus.Events;
using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public class ShipOrderCommandHandler : IRequestHandler<ShipOrderCommand>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<ShipOrderCommandHandler> _logger;

    public ShipOrderCommandHandler(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint, ILogger<ShipOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    public async Task Handle(ShipOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order is null)
        {
            throw new Exception($"Order with ID {request.OrderId} not found.");
        }

        bool isShippable = order.Status == OrderStatus.Paid || (order.Status == OrderStatus.Pending && order.PaymentMethod == "CashOnDelivery");

        if (!isShippable)
        {
            throw new InvalidOperationException($"Order {order.Id} cannot be shipped because its status is '{order.Status}' and payment method is '{order.PaymentMethod}'.");
        }

        if (order.ShippingDetails is null)
        {
            throw new InvalidOperationException($"Cannot ship order {order.Id} because it has no shipping details.");
        }

        order.Status = OrderStatus.Shipped;
        order.UpdatedAt = DateTime.UtcNow;
        order.ShippingDetails.TrackingNumber = request.TrackingNumber;

        await _orderRepository.UpdateAsync(order, cancellationToken);
        _logger.LogInformation("Order {OrderId} status updated to Shipped with tracking number {TrackingNumber}", order.Id, request.TrackingNumber);

        await _publishEndpoint.Publish(new OrderShippedEvent
        {
            OrderId = order.Id,
            UserId = order.UserId,
            TrackingNumber = request.TrackingNumber,
            ShippedAt = DateTime.UtcNow
        }, cancellationToken);
    }
}
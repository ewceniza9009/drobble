using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Domain.Entities;
using Drobble.Shared.EventBus.Events;
using MassTransit;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public CancelOrderCommandHandler(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint)
    {
        _orderRepository = orderRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch the order
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order is null)
        {
            throw new Exception($"Order with ID {request.OrderId} not found."); // Use specific NotFoundException
        }

        // 2. Check if the order can be canceled
        if (order.Status == OrderStatus.Shipped || order.Status == OrderStatus.Delivered)
        {
            throw new InvalidOperationException("Cannot cancel an order that has already been shipped or delivered.");
        }
        if (order.Status == OrderStatus.Cancelled)
        {
            return; // Order is already canceled, do nothing.
        }

        // 3. Update the order status
        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        await _orderRepository.UpdateAsync(order, cancellationToken);

        // 4. Publish an event to notify other services
        var orderCancelledEvent = new OrderCancelledEvent
        {
            OrderId = order.Id,
            UserId = order.UserId,
            Items = order.OrderItems.Select(oi => new OrderItemMessage(oi.ProductId, oi.Quantity, oi.Price)).ToList()
        };

        await _publishEndpoint.Publish(orderCancelledEvent, cancellationToken);
    }
}
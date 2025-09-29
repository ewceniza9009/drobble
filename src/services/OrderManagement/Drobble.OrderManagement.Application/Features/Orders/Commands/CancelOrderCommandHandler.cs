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
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order is null)
        {
            throw new Exception($"Order with ID {request.OrderId} not found.");    
        }

        if (order.Status == OrderStatus.Shipped || order.Status == OrderStatus.Delivered)
        {
            throw new InvalidOperationException("Cannot cancel an order that has already been shipped or delivered.");
        }
        if (order.Status == OrderStatus.Cancelled)
        {
            return;       
        }

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        await _orderRepository.UpdateAsync(order, cancellationToken);

        var orderCancelledEvent = new OrderCancelledEvent
        {
            OrderId = order.Id,
            UserId = order.UserId,
            Items = order.OrderItems.Select(oi => new OrderItemMessage(oi.ProductId, oi.Quantity, oi.Price)).ToList()
        };

        await _publishEndpoint.Publish(orderCancelledEvent, cancellationToken);
    }
}
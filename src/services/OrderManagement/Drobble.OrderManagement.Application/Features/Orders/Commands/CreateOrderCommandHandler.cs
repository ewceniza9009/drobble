// ---- File: src/services/OrderManagement/Application/Features/Orders/Commands/CreateOrderCommandHandler.cs ----
using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Domain.Entities;
using Drobble.Shared.EventBus.Events;
using MassTransit;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IProductCatalogService _productCatalogService;
    private readonly IPublishEndpoint _publishEndpoint;

    public CreateOrderCommandHandler(IOrderRepository orderRepository, IHttpContextAccessor httpContextAccessor, IProductCatalogService productCatalogService, IPublishEndpoint publishEndpoint)
    {
        _orderRepository = orderRepository;
        _httpContextAccessor = httpContextAccessor;
        _productCatalogService = productCatalogService;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new Exception("User ID not found in token.");
        }

        var productIds = request.Items.Select(i => i.ProductId);
        var productDetails = (await _productCatalogService.GetProductsByIdsAsync(productIds, cancellationToken))
                             .ToDictionary(p => p.Id);

        var order = new Order
        {
            UserId = userId,
            Currency = request.Currency,
            Status = OrderStatus.Pending
        };

        foreach (var itemDto in request.Items)
        {
            if (!productDetails.TryGetValue(itemDto.ProductId, out var productDetail))
            {
                throw new Exception($"Product with ID {itemDto.ProductId} not found.");
            }

            order.OrderItems.Add(new OrderItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                Price = productDetail.Price
            });
        }

        order.TotalAmount = order.OrderItems.Sum(item => item.Price * item.Quantity);

        await _orderRepository.AddAsync(order, cancellationToken);

        // Publish the event to the message bus
        await _publishEndpoint.Publish(new OrderCreatedEvent
        {
            OrderId = order.Id,
            UserId = order.UserId,
            TotalAmount = order.TotalAmount,
            Currency = order.Currency,
            Items = order.OrderItems.Select(oi => new OrderItemMessage(oi.ProductId, oi.Quantity, oi.Price)).ToList()
        }, cancellationToken);

        return order.Id;
    }
}
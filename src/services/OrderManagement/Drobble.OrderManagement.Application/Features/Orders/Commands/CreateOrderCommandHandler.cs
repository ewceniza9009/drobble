// ---- File: src/services/OrderManagement/Application/Features/Orders/Commands/CreateOrderCommandHandler.cs ----
using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Domain.Entities;
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

    public CreateOrderCommandHandler(IOrderRepository orderRepository, IHttpContextAccessor httpContextAccessor, IProductCatalogService productCatalogService)
    {
        _orderRepository = orderRepository;
        _httpContextAccessor = httpContextAccessor;
        _productCatalogService = productCatalogService;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new Exception("User ID not found in token.");
        }

        // Fetch current product prices from the Product Catalog service
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
                // In a real app, you'd throw a more specific "ProductNotFound" exception
                throw new Exception($"Product with ID {itemDto.ProductId} not found.");
            }

            order.OrderItems.Add(new OrderItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                Price = productDetail.Price // Use the price from the trusted service
            });
        }

        order.TotalAmount = order.OrderItems.Sum(item => item.Price * item.Quantity);

        await _orderRepository.AddAsync(order, cancellationToken);

        return order.Id;
    }
}
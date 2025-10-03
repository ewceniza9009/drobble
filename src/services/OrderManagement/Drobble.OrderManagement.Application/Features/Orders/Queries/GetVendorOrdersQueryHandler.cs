using Drobble.OrderManagement.Application.Contracts;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

public class GetVendorOrdersQueryHandler : IRequestHandler<GetVendorOrdersQuery, IEnumerable<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductCatalogService _productCatalogService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetVendorOrdersQueryHandler(IOrderRepository orderRepository, IProductCatalogService productCatalogService, IHttpContextAccessor httpContextAccessor)
    {
        _orderRepository = orderRepository;
        _productCatalogService = productCatalogService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IEnumerable<OrderDto>> Handle(GetVendorOrdersQuery request, CancellationToken cancellationToken)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var vendorId))
        {
            throw new UnauthorizedAccessException("Cannot determine vendor from token.");
        }

        var vendorProductIds = (await _productCatalogService.GetProductIdsByVendorAsync(vendorId, cancellationToken)).ToHashSet();

        if (!vendorProductIds.Any())
        {
            return Enumerable.Empty<OrderDto>();
        }

        var orders = await _orderRepository.GetOrdersByProductIdsAsync(vendorProductIds, cancellationToken);

        return orders.Select(order => new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            Currency = order.Currency,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems
                        .Where(oi => vendorProductIds.Contains(oi.ProductId))   
                        .Select(oi => new OrderItemDto
                        {
                            ProductId = oi.ProductId,
                            Quantity = oi.Quantity,
                            Price = oi.Price
                        }).ToList()
        });
    }
}
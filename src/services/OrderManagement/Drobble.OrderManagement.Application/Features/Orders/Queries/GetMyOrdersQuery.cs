using MediatR;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Drobble.OrderManagement.Application.Contracts;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

// The Query: Represents the request for the current user's orders. It has no parameters
// because the user's identity is determined from their authenticated session.
public record GetMyOrdersQuery : IRequest<IEnumerable<OrderDto>>;

// The Handler: Contains the logic to process the query
public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, IEnumerable<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetMyOrdersQueryHandler(IOrderRepository orderRepository, IHttpContextAccessor httpContextAccessor)
    {
        _orderRepository = orderRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IEnumerable<OrderDto>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            // In a real application, you might throw a specific Unauthorized exception
            throw new Exception("User is not authenticated or user ID is missing.");
        }

        var orders = await _orderRepository.GetOrdersByUserIdAsync(userId, cancellationToken);

        // Map the domain entities to DTOs
        return orders.Select(order => new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            Currency = order.Currency,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                ProductId = oi.ProductId,
                Quantity = oi.Quantity,
                Price = oi.Price
            }).ToList()
        });
    }
}
using Drobble.OrderManagement.Application.Contracts;
using MediatR;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

// Change the return type to the new PaginatedResult
public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, PaginatedResult<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserManagementService _userManagementService;

    public GetAllOrdersQueryHandler(IOrderRepository orderRepository, IUserManagementService userManagementService)
    {
        _orderRepository = orderRepository;
        _userManagementService = userManagementService;
    }

    public async Task<PaginatedResult<OrderDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        // Get both the orders and the total count from the repository
        var (orders, totalCount) = await _orderRepository.GetAllAsync(request.Page, request.PageSize, cancellationToken);

        // --- DATA ENRICHMENT ---
        // 1. Get all unique user IDs from the orders
        var userIds = orders.Select(o => o.UserId).Distinct();

        // 2. Fetch the user data in a single batch call
        var users = await _userManagementService.GetUsersByIdsAsync(userIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id, u => u.Username);

        // 3. Map to DTOs and add the username
        var orderDtos = orders.Select(order => new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            Username = userMap.GetValueOrDefault(order.UserId, "Unknown User"), // Add username
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

        return new PaginatedResult<OrderDto>
        {
            Items = orderDtos,
            Total = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
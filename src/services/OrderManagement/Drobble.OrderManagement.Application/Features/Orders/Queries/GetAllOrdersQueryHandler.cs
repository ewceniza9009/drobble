using Drobble.OrderManagement.Application.Contracts;
using MediatR;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

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
        var (orders, totalCount) = await _orderRepository.GetAllAsync(request.Page, request.PageSize, cancellationToken);

        var userIds = orders.Select(o => o.UserId).Distinct();

        var users = await _userManagementService.GetUsersByIdsAsync(userIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id, u => u.Username);

        var orderDtos = orders.Select(order => new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            Username = userMap.GetValueOrDefault(order.UserId, "Unknown User"),
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            Currency = order.Currency,
            CreatedAt = order.CreatedAt,
            PaymentMethod = order.PaymentMethod,
            ShippingCost = order.ShippingCost,
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
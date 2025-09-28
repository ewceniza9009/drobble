using Drobble.OrderManagement.Application.Contracts;
using MediatR;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

// Change the return type to the new PaginatedResult
public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, PaginatedResult<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetAllOrdersQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<PaginatedResult<OrderDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        // Get both the orders and the total count from the repository
        var (orders, totalCount) = await _orderRepository.GetAllAsync(request.Page, request.PageSize, cancellationToken);

        // Map the domain entities to DTOs
        var orderDtos = orders.Select(order => new OrderDto
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

        // Return the new paginated result object
        return new PaginatedResult<OrderDto>
        {
            Items = orderDtos,
            Total = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
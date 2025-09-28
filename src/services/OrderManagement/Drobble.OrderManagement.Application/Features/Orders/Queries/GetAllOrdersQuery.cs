using MediatR;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

// Add pagination parameters
public record GetAllOrdersQuery(int Page = 1, int PageSize = 20) : IRequest<PaginatedResult<OrderDto>>;
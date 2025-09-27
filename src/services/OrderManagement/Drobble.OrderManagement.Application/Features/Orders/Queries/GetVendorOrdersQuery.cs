
using MediatR;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

public record GetVendorOrdersQuery() : IRequest<IEnumerable<OrderDto>>;


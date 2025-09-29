using MediatR;
using System;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

public record GetOrderByIdQuery(Guid Id) : IRequest<OrderDto?>;
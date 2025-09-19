// src/services/OrderManagement/Drobble.OrderManagement.Application/Features/Orders/Queries/GetOrderByIdQuery.cs
using MediatR;
using System;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

public record GetOrderByIdQuery(Guid Id) : IRequest<OrderDto?>;
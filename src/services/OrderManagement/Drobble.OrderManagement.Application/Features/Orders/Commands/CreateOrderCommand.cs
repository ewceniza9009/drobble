// src/services/OrderManagement/Drobble.OrderManagement.Application/Features/Orders/Commands/CreateOrderCommand.cs
using MediatR;
using System;
using System.Collections.Generic;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public record CreateOrderCommand(
    Guid UserId,
    List<OrderItemDto> Items,
    string Currency) : IRequest<Guid>;

public record OrderItemDto(string ProductId, int Quantity, decimal Price);
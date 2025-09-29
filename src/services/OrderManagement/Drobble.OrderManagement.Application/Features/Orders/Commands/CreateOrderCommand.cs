using MediatR;
using System;
using System.Collections.Generic;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public record CreateOrderCommand(
    List<OrderItemDto> Items,
    string Currency) : IRequest<Guid>;

public record OrderItemDto(string ProductId, int Quantity, decimal Price);
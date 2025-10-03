using MediatR;
using System;
using System.Collections.Generic;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public record CreateOrderCommand(
    List<OrderItemDto> Items,
    string Currency,
    ShippingAddressDto ShippingAddress) : IRequest<Guid>;

public record OrderItemDto(string ProductId, int Quantity, decimal Price);

public record ShippingAddressDto(string FullName, string AddressLine, string City, string State, string ZipCode, string Country);
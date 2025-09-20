using MediatR;
using System;

namespace Drobble.ShoppingCart.Application.Features.Carts.Commands;

public record AddItemToCartCommand(
    string ProductId,
    int Quantity,
    Guid? UserId,       // Null if the user is a guest
    string? SessionId)  // Null if the user is logged in
    : IRequest<CartDto>;
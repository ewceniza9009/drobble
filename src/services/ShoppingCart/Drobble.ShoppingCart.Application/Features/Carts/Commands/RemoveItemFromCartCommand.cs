using MediatR;
using System;
using Drobble.ShoppingCart.Application.Contracts;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Bson;

namespace Drobble.ShoppingCart.Application.Features.Carts.Commands;

public record RemoveItemFromCartCommand(
    string ProductId,
    Guid? UserId,
    string? SessionId) : IRequest<CartDto>;

public class RemoveItemFromCartCommandHandler : IRequestHandler<RemoveItemFromCartCommand, CartDto>
{
    private readonly ICartRepository _cartRepository;

    public RemoveItemFromCartCommandHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<CartDto> Handle(RemoveItemFromCartCommand request, CancellationToken cancellationToken)
    {
        var cart = request.UserId.HasValue
            ? await _cartRepository.GetByUserIdAsync(request.UserId.Value, cancellationToken)
            : await _cartRepository.GetBySessionIdAsync(request.SessionId!, cancellationToken);

        if (cart is null)
        {
            throw new Exception("Cart not found.");
        }

        var itemToRemove = cart.Items.FirstOrDefault(i => i.ProductId == ObjectId.Parse(request.ProductId));
        if (itemToRemove != null)
        {
            cart.Items.Remove(itemToRemove);
            await _cartRepository.UpdateAsync(cart, cancellationToken);
        }

        // Map and return the updated cart state
        return new CartDto
        {
            Id = cart.Id.ToString(),
            Total = cart.Total,
            Items = cart.Items.Select(i => new CartItemDto
            {
                ProductId = i.ProductId.ToString(),
                Quantity = i.Quantity,
                PriceAtAdd = i.PriceAtAdd
            }).ToList()
        };
    }
}
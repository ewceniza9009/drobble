using Drobble.ShoppingCart.Application.Contracts;
using Drobble.ShoppingCart.Application.Mappings;
using MediatR;
using MongoDB.Bson;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ShoppingCart.Application.Features.Carts.Commands;

public record UpdateItemQuantityCommand(string ProductId, int Quantity, Guid? UserId, string? SessionId) : IRequest<CartDto?>;

public class UpdateItemQuantityCommandHandler : IRequestHandler<UpdateItemQuantityCommand, CartDto?>
{
    private readonly ICartRepository _cartRepository;

    public UpdateItemQuantityCommandHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<CartDto?> Handle(UpdateItemQuantityCommand request, CancellationToken cancellationToken)
    {
        var cart = request.UserId.HasValue
            ? await _cartRepository.GetByUserIdAsync(request.UserId.Value, cancellationToken)
            : await _cartRepository.GetBySessionIdAsync(request.SessionId!, cancellationToken);

        if (cart is null)
        {
            return null; // No cart found to update
        }

        var itemToUpdate = cart.Items.FirstOrDefault(i => i.ProductId == ObjectId.Parse(request.ProductId));
        if (itemToUpdate != null)
        {
            if (request.Quantity <= 0)
            {
                // If quantity is 0 or less, remove the item
                cart.Items.Remove(itemToUpdate);
            }
            else
            {
                // Otherwise, update the quantity
                itemToUpdate.Quantity = request.Quantity;
            }

            await _cartRepository.UpdateAsync(cart, cancellationToken);
        }

        return cart.ToDto();
    }
}
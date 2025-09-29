using Drobble.ShoppingCart.Application.Features.Carts;
using Drobble.ShoppingCart.Domain.Entities;
using System.Linq;

namespace Drobble.ShoppingCart.Application.Mappings;

public static class CartMappings
{
    public static CartDto? ToDto(this Cart? cart)
    {
        if (cart is null)
        {
            return null;
        }

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
using Drobble.ShoppingCart.Application.Contracts;
using Drobble.ShoppingCart.Application.Mappings;
using Drobble.ShoppingCart.Domain.Entities;
using MediatR;
using MongoDB.Bson;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ShoppingCart.Application.Features.Carts.Commands;

public class AddItemToCartCommandHandler : IRequestHandler<AddItemToCartCommand, CartDto>
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductCatalogService _productCatalogService;

    public AddItemToCartCommandHandler(ICartRepository cartRepository, IProductCatalogService productCatalogService)
    {
        _cartRepository = cartRepository;
        _productCatalogService = productCatalogService;
    }

    public async Task<CartDto> Handle(AddItemToCartCommand request, CancellationToken cancellationToken)
    {
        var product = await _productCatalogService.GetProductByIdAsync(ObjectId.Parse(request.ProductId), cancellationToken);
        if (product is null)
        {
            throw new Exception("Product not found.");
        }

        var cart = request.UserId.HasValue
            ? await _cartRepository.GetByUserIdAsync(request.UserId.Value, cancellationToken)
            : await _cartRepository.GetBySessionIdAsync(request.SessionId!, cancellationToken);

        if (cart is null)
        {
            cart = new Domain.Entities.Cart { UserId = request.UserId, SessionId = request.SessionId };
        }

        var existingItem = cart.Items.FirstOrDefault(item => item.ProductId.ToString() == product.Id);
        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                ProductId = ObjectId.Parse(product.Id),
                Quantity = request.Quantity,
                PriceAtAdd = product.Price
            });
        }

        if (cart.Id == ObjectId.Empty)
        {
            await _cartRepository.CreateAsync(cart, cancellationToken);
        }
        else
        {
            await _cartRepository.UpdateAsync(cart, cancellationToken);
        }

        // Use the new extension method
        return cart.ToDto()!;
    }
}
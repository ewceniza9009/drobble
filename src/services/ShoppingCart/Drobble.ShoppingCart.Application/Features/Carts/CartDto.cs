using System;
using System.Collections.Generic;

namespace Drobble.ShoppingCart.Application.Features.Carts;

public class CartDto
{
    public string Id { get; set; } = string.Empty;
    public List<CartItemDto> Items { get; set; } = new();
    public decimal Total { get; set; }
}

public class CartItemDto
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal PriceAtAdd { get; set; }
}
// ---- File: src/services/ShoppingCart/Domain/Entitites/Cart.cs ----
using Drobble.Shared.Kernel;
using MongoDB.Bson;

namespace Drobble.ShoppingCart.Domain.Entities;

public class Cart : Entity<ObjectId>
{
    public Guid? UserId { get; set; }
    public string? SessionId { get; set; }
    public List<CartItem> Items { get; set; } = new();

    // The calculated property without any attributes.
    public decimal Total => Items.Sum(item => item.PriceAtAdd * item.Quantity);
}
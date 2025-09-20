using Drobble.Shared.Kernel;
using MongoDB.Bson;

namespace Drobble.ShoppingCart.Domain.Entities;

public class Cart : Entity<ObjectId>
{
    // Nullable for guest carts
    public Guid? UserId { get; set; }

    // Nullable for authenticated user carts, used to identify guest carts
    public string? SessionId { get; set; }

    public List<CartItem> Items { get; set; } = new();

    // A helper method to compute the total price
    public decimal Total => Items.Sum(item => item.PriceAtAdd * item.Quantity);
}
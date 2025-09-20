using MongoDB.Bson;

namespace Drobble.ShoppingCart.Domain.Entities;

public class CartItem
{
    public ObjectId ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal PriceAtAdd { get; set; } // The price of the product when it was added
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
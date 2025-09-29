using MongoDB.Bson;

namespace Drobble.ShoppingCart.Domain.Entities;

public class CartItem
{
    public ObjectId ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal PriceAtAdd { get; set; }          
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
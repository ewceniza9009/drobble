// src/services/OrderManagement/Drobble.OrderManagement.Domain/Entities/OrderItem.cs
using Drobble.Shared.Kernel;

namespace Drobble.OrderManagement.Domain.Entities;

public class OrderItem : Entity<Guid>
{
    public Guid OrderId { get; set; }
    public string ProductId { get; set; } // Storing as string since it comes from MongoDB (ObjectId.ToString())
    public int Quantity { get; set; }
    public decimal Price { get; set; } // Price of the item at the time of purchase
    public decimal Discounts { get; set; }

    // Navigation property for EF Core
    public Order Order { get; set; }
}
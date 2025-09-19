// src/services/OrderManagement/Drobble.OrderManagement.Domain/Entities/Order.cs
using Drobble.Shared.Kernel;
using System.Collections.Generic;

namespace Drobble.OrderManagement.Domain.Entities;

public class Order : Entity<Guid>
{
    public Guid UserId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } // ISO 4217 code, e.g., "USD"

    // Navigation properties for EF Core
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public Shipping ShippingDetails { get; set; }
}

public enum OrderStatus
{
    Pending,
    Paid,
    Shipped,
    Delivered,
    Cancelled,
    Refunded
}
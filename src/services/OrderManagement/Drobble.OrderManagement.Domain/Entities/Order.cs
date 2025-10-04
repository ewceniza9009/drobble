using Drobble.Shared.Kernel;
using System.Collections.Generic;

namespace Drobble.OrderManagement.Domain.Entities;

public class Order : Entity<Guid>
{
    public Guid UserId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "PHP";
    public string PaymentMethod { get; set; }   
    public decimal ShippingCost { get; set; }

    public string? AppliedPromoCode { get; set; }
    public decimal DiscountAmount { get; set; } = 0;

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
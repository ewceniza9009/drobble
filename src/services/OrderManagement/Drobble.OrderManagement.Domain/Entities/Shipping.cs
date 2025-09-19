// src/services/OrderManagement/Drobble.OrderManagement.Domain/Entities/Shipping.cs
using Drobble.Shared.Kernel;
using System;

namespace Drobble.OrderManagement.Domain.Entities;

public class Shipping : Entity<Guid>
{
    public Guid OrderId { get; set; }
    public string Address { get; set; } // Could be JSONB in the DB, string for simplicity here
    public ShippingMethod Method { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? EstimatedDelivery { get; set; }

    // Navigation property for EF Core
    public Order Order { get; set; }
}

public enum ShippingMethod
{
    Standard,
    Express
}
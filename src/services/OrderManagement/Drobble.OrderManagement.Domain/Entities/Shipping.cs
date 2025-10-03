using Drobble.Shared.Kernel;
using System;

namespace Drobble.OrderManagement.Domain.Entities;

public class Shipping : Entity<Guid>
{
    public Guid OrderId { get; set; }
    public string Address { get; set; }           
    public ShippingMethod Method { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? EstimatedDelivery { get; set; }

    public Order Order { get; set; }
}

public enum ShippingMethod
{
    Standard,
    Express
}
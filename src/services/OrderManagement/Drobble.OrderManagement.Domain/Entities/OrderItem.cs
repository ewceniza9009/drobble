using Drobble.Shared.Kernel;

namespace Drobble.OrderManagement.Domain.Entities;

public class OrderItem : Entity<Guid>
{
    public Guid OrderId { get; set; }
    public string ProductId { get; set; }          
    public int Quantity { get; set; }
    public decimal Price { get; set; }          
    public decimal Discounts { get; set; }

    public Order Order { get; set; }
}
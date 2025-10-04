namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

public class OrderDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "PHP";
    public DateTime CreatedAt { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal ShippingCost { get; set; }

    public string? AppliedPromoCode { get; set; }
    public decimal DiscountAmount { get; set; }

    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
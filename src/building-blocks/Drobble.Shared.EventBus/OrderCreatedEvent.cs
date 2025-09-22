// ---- File: src/building-blocks/Drobble.Shared.EventBus/Events/OrderCreatedEvent.cs ----
namespace Drobble.Shared.EventBus.Events;

// Using a record for an immutable, data-centric event contract
public record OrderCreatedEvent
{
    public Guid OrderId { get; init; }
    public Guid UserId { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; }
    public List<OrderItemMessage> Items { get; init; } = new();
}

public record OrderItemMessage(string ProductId, int Quantity, decimal Price);
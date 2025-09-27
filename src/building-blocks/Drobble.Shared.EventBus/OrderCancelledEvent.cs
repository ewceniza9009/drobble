namespace Drobble.Shared.EventBus.Events;

/// <summary>
/// Published when an order has been successfully canceled.
/// </summary>
public record OrderCancelledEvent
{
    public Guid OrderId { get; init; }
    public Guid UserId { get; init; }
    public List<OrderItemMessage> Items { get; init; } = new();
}
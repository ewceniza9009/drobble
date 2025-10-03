namespace Drobble.Shared.EventBus.Events;

public record OrderShippedEvent
{
    public Guid OrderId { get; init; }
    public Guid UserId { get; init; }
    public string TrackingNumber { get; init; }
    public DateTime ShippedAt { get; init; }
}
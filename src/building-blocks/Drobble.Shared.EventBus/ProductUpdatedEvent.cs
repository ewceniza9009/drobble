// ---- File: src/building-blocks/Drobble.Shared.EventBus/Events/ProductUpdatedEvent.cs ----
namespace Drobble.Shared.EventBus.Events;

/// <summary>
/// Published when an existing product's details are updated.
/// </summary>
public record ProductUpdatedEvent
{
    public string Id { get; init; }
    public string Name { get; init; }
    public string Description { get; init; }
    public decimal Price { get; init; }
    public string? ImageUrl { get; init; }
}
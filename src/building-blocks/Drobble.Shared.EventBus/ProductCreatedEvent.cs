// ---- File: src/building-blocks/Drobble.Shared.EventBus/Events/ProductCreatedEvent.cs ----
namespace Drobble.Shared.EventBus.Events;

/// <summary>
/// Published when a new product is created in the Product Catalog.
/// </summary>
public record ProductCreatedEvent
{
    public string Id { get; init; }
    public string Name { get; init; }
    public string Description { get; init; }
    public decimal Price { get; init; }
    public string? ImageUrl { get; init; }
}
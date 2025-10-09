namespace Drobble.Shared.EventBus.Events;

// A simple record to hold the essential product data for indexing
public record ProductReindexData
{
    public string Id { get; init; }
    public string Name { get; init; }
    public string Description { get; init; }
    public decimal Price { get; init; }
    public string? ImageUrl { get; init; }
}

// The main event that will be published with a list of all products
public record ProductsReindexRequestedEvent
{
    public List<ProductReindexData> Products { get; init; } = new();
}
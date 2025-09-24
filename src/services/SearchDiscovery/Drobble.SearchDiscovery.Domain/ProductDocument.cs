// ---- File: src/services/SearchDiscovery/Domain/ProductDocument.cs ----
namespace Drobble.SearchDiscovery.Domain;

/// <summary>
/// Represents a flattened product record for storage and searching in Elasticsearch.
/// </summary>
public class ProductDocument
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
}
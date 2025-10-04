using Drobble.Shared.Kernel;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Domain.Entities;

public class Product : Entity<ObjectId>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public ObjectId CategoryId { get; set; }
    public Guid? VendorId { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;

    public string? Sku { get; set; }
    public decimal Weight { get; set; }
}

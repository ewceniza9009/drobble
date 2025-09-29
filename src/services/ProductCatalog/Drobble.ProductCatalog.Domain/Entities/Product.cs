using Drobble.Shared.Kernel;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Domain.Entities;

public class Product : Entity<ObjectId>
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public ObjectId CategoryId { get; set; }
    public Guid? VendorId { get; set; }      
    public List<string> ImageUrls { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;      
}
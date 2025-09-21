// src/services/ProductCatalog/Drobble.ProductCatalog.Domain/Entities/Product.cs
using Drobble.Shared.Kernel;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Drobble.ProductCatalog.Domain.Entities;

public class Product : Entity<ObjectId>
{
    // The 'Id' property is now inherited. No need to declare it here!
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public ObjectId CategoryId { get; set; }
    public List<ProductAttribute> Attributes { get; set; } = new();
    public List<string> ImageUrls { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public string? ImageUrl { get; set; } 
}

public class ProductAttribute
{
    public string Key { get; set; }
    public string Value { get; set; }
}
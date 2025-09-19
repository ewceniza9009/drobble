// src/services/ProductCatalog/Drobble.ProductCatalog.Domain/Entities/Category.cs
using Drobble.Shared.Kernel;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Drobble.ProductCatalog.Domain.Entities;

public class Category : Entity<ObjectId>
{
    // The 'Id' property is now inherited.
    public string Name { get; set; }
    public string Slug { get; set; }
    public string Description { get; set; }
    public ObjectId? ParentId { get; set; }
}
// src/services/ProductCatalog/Drobble.ProductCatalog.Domain/Entities/Inventory.cs
using Drobble.Shared.Kernel;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Drobble.ProductCatalog.Domain.Entities;

public class Inventory : Entity<ObjectId>
{
    // The 'Id' property is now inherited.
    public ObjectId ProductId { get; set; }
    public int Quantity { get; set; }
    public int Reserved { get; set; }
    public DateTime LastUpdated { get; set; }
}
using Drobble.Shared.Kernel;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Drobble.ProductCatalog.Domain.Entities;

public class Inventory : Entity<ObjectId>
{
    public ObjectId ProductId { get; set; }
    public int Quantity { get; set; }
    public int Reserved { get; set; }
    public DateTime LastUpdated { get; set; }
}
using Drobble.Shared.Kernel;
using Drobble.ProductCatalog.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Drobble.ProductCatalog.Infrastructure.Persistence;

public static class MongoDbPersistence
{
    public static void Configure()
    {
        // Register a class map for the base Entity to handle the Id.
        BsonClassMap.RegisterClassMap<Entity<ObjectId>>(cm =>
        {
            cm.AutoMap();
            cm.MapIdMember(c => c.Id);
        });

        // Register the map for the Product class.
        BsonClassMap.RegisterClassMap<Product>(cm =>
        {
            cm.AutoMap();
        });

        // Crucially, tell the driver to serialize Guids as strings.
        BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
    }
}

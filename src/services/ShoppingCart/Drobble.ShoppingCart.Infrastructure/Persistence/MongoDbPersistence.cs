using Drobble.Shared.Kernel;
using Drobble.ShoppingCart.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Drobble.ShoppingCart.Infrastructure.Persistence;

public static class MongoDbPersistence
{
    public static void Configure()
    {
        // First, create a map for the base Entity class.
        // This teaches the driver how to handle the properties that all entities share.
        BsonClassMap.RegisterClassMap<Entity<ObjectId>>(cm =>
        {
            cm.AutoMap();
            cm.MapIdMember(c => c.Id); // Map the inherited Id property here.
        });

        // Now, register the map for the specific Cart class.
        // It will automatically use the map from the Entity base class that we just defined.
        BsonClassMap.RegisterClassMap<Cart>(cm =>
        {
            cm.AutoMap();
            cm.UnmapProperty(c => c.Total); // We only need to configure properties specific to Cart.
        });

        BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
    }
}
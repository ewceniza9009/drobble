using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Drobble.ReviewsRatings.Infrastructure.Persistence;

public static class MongoDbPersistence
{
    public static void Configure()
    {
        // This tells the MongoDB driver to treat all Guids as strings by default.
        BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
    }
}
// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Infrastructure/Persistence/MongoDbSettings.cs ----
namespace Drobble.ReviewsRatings.Infrastructure.Persistence;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
}
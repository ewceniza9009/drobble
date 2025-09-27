// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Infrastructure/Persistence/ReviewRepository.cs ----
using Drobble.ReviewsRatings.Application.Contracts;
using Drobble.ReviewsRatings.Domain.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Drobble.ReviewsRatings.Infrastructure.Persistence;

public class ReviewRepository : IReviewRepository
{
    private readonly IMongoCollection<Review> _reviewsCollection;

    public ReviewRepository(IOptions<MongoDbSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
        _reviewsCollection = mongoDatabase.GetCollection<Review>("reviews");
    }

    public async Task AddAsync(Review review, CancellationToken cancellationToken = default)
    {
        await _reviewsCollection.InsertOneAsync(review, null, cancellationToken);
    }

    public async Task<Review?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default)
    {
        return await _reviewsCollection.Find(r => r.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Review> Reviews, long TotalCount)> GetByProductIdAsync(ObjectId productId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Review>.Filter.And(
            Builders<Review>.Filter.Eq(r => r.ProductId, productId),
            Builders<Review>.Filter.Eq(r => r.ModerationStatus, ModerationStatus.Approved)
        );

        var totalCount = await _reviewsCollection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var reviews = await _reviewsCollection.Find(filter)
            .SortByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        return (reviews, totalCount);
    }

    public async Task<(IEnumerable<Review> Reviews, long TotalCount)> GetPendingReviewsAsync(int page, int pageSize, Guid? vendorId, CancellationToken cancellationToken = default)
    {
        var builder = Builders<Review>.Filter;
        var filter = builder.Eq(r => r.ModerationStatus, ModerationStatus.Pending);

        // If a vendorId is provided, add it to the filter
        if (vendorId.HasValue)
        {
            filter &= builder.Eq(r => r.VendorId, vendorId.Value);
        }

        var totalCount = await _reviewsCollection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var reviews = await _reviewsCollection.Find(filter)
            .SortByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        return (reviews, totalCount);
    }

    public async Task<bool> UpdateAsync(Review review, CancellationToken cancellationToken = default)
    {
        var result = await _reviewsCollection.ReplaceOneAsync(r => r.Id == review.Id, review, cancellationToken: cancellationToken);
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }
}
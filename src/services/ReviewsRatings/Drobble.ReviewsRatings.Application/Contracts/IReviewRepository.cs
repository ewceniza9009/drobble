// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Application/Contracts/IReviewRepository.cs ----
using Drobble.ReviewsRatings.Domain.Entities;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ReviewsRatings.Application.Contracts;

/// <summary>
/// Defines the contract for data access operations related to reviews.
/// </summary>
public interface IReviewRepository
{
    /// <summary>
    /// Adds a new review to the data store.
    /// </summary>
    /// <param name="review">The review entity to add.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    Task AddAsync(Review review, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a single review by its unique ID.
    /// </summary>
    /// <param name="id">The unique ID of the review.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The found review or null if not found.</returns>
    Task<Review?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a paginated list of approved reviews for a specific product.
    /// </summary>
    /// <param name="productId">The ID of the product.</param>
    /// <param name="page">The page number to retrieve.</param>
    /// <param name="pageSize">The number of reviews per page.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A tuple containing the list of reviews and the total count of approved reviews for the product.</returns>
    Task<(IEnumerable<Review> Reviews, long TotalCount)> GetByProductIdAsync(ObjectId productId, int page, int pageSize, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a paginated list of reviews awaiting moderation.
    /// </summary>
    /// <param name="page">The page number.</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A tuple containing the list of pending reviews and the total count.</returns>
    Task<(IEnumerable<Review> Reviews, long TotalCount)> GetPendingReviewsAsync(int page, int pageSize, Guid? vendorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing review in the data store, typically for moderation.
    /// </summary>
    /// <param name="review">The review entity with updated values.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the update was successful, otherwise false.</returns>
    Task<bool> UpdateAsync(Review review, CancellationToken cancellationToken = default);
}
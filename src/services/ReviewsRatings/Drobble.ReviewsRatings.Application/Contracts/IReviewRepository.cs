using Drobble.ReviewsRatings.Domain.Entities;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ReviewsRatings.Application.Contracts;

public interface IReviewRepository
{
    Task AddAsync(Review review, CancellationToken cancellationToken = default);
    Task<Review?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Review> Reviews, long TotalCount)> GetByProductIdAsync(ObjectId productId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Review> Reviews, long TotalCount)> GetPendingReviewsAsync(int page, int pageSize, Guid? vendorId, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Review review, CancellationToken cancellationToken = default);
}
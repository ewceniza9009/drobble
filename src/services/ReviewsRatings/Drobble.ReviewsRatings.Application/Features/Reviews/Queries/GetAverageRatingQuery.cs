// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Application/Features/Reviews/Queries/GetAverageRatingQuery.cs ----
using Drobble.ReviewsRatings.Application.Contracts;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ReviewsRatings.Application.Features.Reviews.Queries;

public record GetAverageRatingQuery(string ProductId) : IRequest<AverageRatingDto>;

public class GetAverageRatingQueryHandler : IRequestHandler<GetAverageRatingQuery, AverageRatingDto>
{
    private readonly IReviewRepository _reviewRepository;

    public GetAverageRatingQueryHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<AverageRatingDto> Handle(GetAverageRatingQuery request, CancellationToken cancellationToken)
    {
        // This is a placeholder. We will make it more efficient in the next step.
        var (reviews, totalCount) = await _reviewRepository.GetByProductIdAsync(ObjectId.Parse(request.ProductId), 1, int.MaxValue, cancellationToken);

        var averageRating = totalCount > 0 ? reviews.Average(r => r.Rating) : 0;

        return new AverageRatingDto
        {
            AverageRating = averageRating,
            ReviewCount = totalCount
        };
    }
}
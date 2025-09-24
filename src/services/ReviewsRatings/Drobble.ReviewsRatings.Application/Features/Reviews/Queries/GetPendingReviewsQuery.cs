// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Application/Features/Reviews/Queries/GetPendingReviewsQuery.cs ----
using Drobble.ReviewsRatings.Application.Contracts;
using MediatR;

namespace Drobble.ReviewsRatings.Application.Features.Reviews.Queries;

public record GetPendingReviewsQuery(int Page = 1, int PageSize = 10) : IRequest<PaginatedResult<ReviewDto>>;

public class GetPendingReviewsQueryHandler : IRequestHandler<GetPendingReviewsQuery, PaginatedResult<ReviewDto>>
{
    private readonly IReviewRepository _reviewRepository;

    public GetPendingReviewsQueryHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<PaginatedResult<ReviewDto>> Handle(GetPendingReviewsQuery request, CancellationToken cancellationToken)
    {
        var (reviews, totalCount) = await _reviewRepository.GetPendingReviewsAsync(request.Page, request.PageSize, cancellationToken);

        var reviewDtos = reviews.Select(r => new ReviewDto
        {
            Id = r.Id.ToString(),
            UserId = r.UserId,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        });

        return new PaginatedResult<ReviewDto>
        {
            Items = reviewDtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
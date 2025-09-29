using Drobble.ReviewsRatings.Application.Contracts;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ReviewsRatings.Application.Features.Reviews.Queries;

public record GetReviewsByProductQuery(
    string ProductId,
    int Page = 1,
    int PageSize = 10) : IRequest<PaginatedResult<ReviewDto>>;

public class GetReviewsByProductQueryHandler : IRequestHandler<GetReviewsByProductQuery, PaginatedResult<ReviewDto>>
{
    private readonly IReviewRepository _reviewRepository;

    public GetReviewsByProductQueryHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<PaginatedResult<ReviewDto>> Handle(GetReviewsByProductQuery request, CancellationToken cancellationToken)
    {
        var (reviews, totalCount) = await _reviewRepository.GetByProductIdAsync(
            ObjectId.Parse(request.ProductId), request.Page, request.PageSize, cancellationToken);

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
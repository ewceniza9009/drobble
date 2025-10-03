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

    private readonly IUserManagementService _userManagementService;

    public GetReviewsByProductQueryHandler(IReviewRepository reviewRepository, IUserManagementService userManagementService)
    {
        _reviewRepository = reviewRepository;
        _userManagementService = userManagementService;
    }

    public async Task<PaginatedResult<ReviewDto>> Handle(GetReviewsByProductQuery request, CancellationToken cancellationToken)
    {
        var (reviews, totalCount) = await _reviewRepository.GetByProductIdAsync(
            ObjectId.Parse(request.ProductId), request.Page, request.PageSize, cancellationToken);

        var userIds = reviews.Select(r => r.UserId).Distinct();

        var users = await _userManagementService.GetUsersByIdsAsync(userIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id, u => u.Username);

        var reviewDtos = reviews.Select(r => new ReviewDto
        {
            Id = r.Id.ToString(),
            UserId = r.UserId,
            UserName = userMap.GetValueOrDefault(r.UserId, "Unknown User"),
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
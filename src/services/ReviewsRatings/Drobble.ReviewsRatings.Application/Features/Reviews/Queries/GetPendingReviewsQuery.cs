using Drobble.ReviewsRatings.Application.Contracts;
using Drobble.ReviewsRatings.Application.Features.Reviews.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

public record GetPendingReviewsQuery(int Page = 1, int PageSize = 10, bool IsVendorRequest = false) : IRequest<PaginatedResult<ReviewDto>>;

public class GetPendingReviewsQueryHandler : IRequestHandler<GetPendingReviewsQuery, PaginatedResult<ReviewDto>>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;
    public GetPendingReviewsQueryHandler(IReviewRepository reviewRepository, IHttpContextAccessor httpContextAccessor)
    {
        _reviewRepository = reviewRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<PaginatedResult<ReviewDto>> Handle(GetPendingReviewsQuery request, CancellationToken cancellationToken)
    {
        Guid? vendorId = null;
        if (request.IsVendorRequest)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var id))
            {
                return new PaginatedResult<ReviewDto>();
            }
            vendorId = id;
        }

        var (reviews, totalCount) = await _reviewRepository.GetPendingReviewsAsync(request.Page, request.PageSize, vendorId, cancellationToken);

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
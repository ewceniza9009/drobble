// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Application/Features/Reviews/Commands/CreateReviewCommandHandler.cs ----
using Drobble.ReviewsRatings.Application.Contracts;
using Drobble.ReviewsRatings.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using System.Security.Claims;

namespace Drobble.ReviewsRatings.Application.Features.Reviews.Commands;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ObjectId>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CreateReviewCommandHandler(IReviewRepository reviewRepository, IHttpContextAccessor httpContextAccessor)
    {
        _reviewRepository = reviewRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<ObjectId> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        // Note: Logic to set 'VerifiedPurchase' by checking the Order service will be added later.

        var review = new Review
        {
            ProductId = ObjectId.Parse(request.ProductId),
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            VerifiedPurchase = false,
            ModerationStatus = ModerationStatus.Pending
        };

        await _reviewRepository.AddAsync(review, cancellationToken);

        return review.Id;
    }
}
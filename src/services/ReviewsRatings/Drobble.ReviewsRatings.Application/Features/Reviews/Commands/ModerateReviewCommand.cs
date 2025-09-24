// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Application/Features/Reviews/Commands/ModerateReviewCommand.cs ----
using Drobble.ReviewsRatings.Application.Contracts;
using Drobble.ReviewsRatings.Domain.Entities;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ReviewsRatings.Application.Features.Reviews.Commands;

public record ModerateReviewCommand(string ReviewId, bool Approve) : IRequest;

public class ModerateReviewCommandHandler : IRequestHandler<ModerateReviewCommand>
{
    private readonly IReviewRepository _reviewRepository;

    public ModerateReviewCommandHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task Handle(ModerateReviewCommand request, CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(request.ReviewId, out var reviewObjectId))
        {
            throw new ArgumentException("Invalid ReviewId format.");
        }

        var review = await _reviewRepository.GetByIdAsync(reviewObjectId, cancellationToken);
        if (review is null)
        {
            throw new KeyNotFoundException($"Review with Id {request.ReviewId} not found.");
        }

        review.ModerationStatus = request.Approve ? ModerationStatus.Approved : ModerationStatus.Rejected;
        review.UpdatedAt = DateTime.UtcNow;

        await _reviewRepository.UpdateAsync(review, cancellationToken);
    }
}
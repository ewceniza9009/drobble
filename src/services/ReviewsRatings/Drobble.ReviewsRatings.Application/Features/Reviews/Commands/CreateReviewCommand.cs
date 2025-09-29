using MediatR;
using MongoDB.Bson;

namespace Drobble.ReviewsRatings.Application.Features.Reviews.Commands;

public record CreateReviewCommand(
    string ProductId,
    int Rating,
    string? Comment) : IRequest<ObjectId>;
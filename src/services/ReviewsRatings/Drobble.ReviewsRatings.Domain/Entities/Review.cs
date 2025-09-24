// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Domain/Entities/Review.cs ----
using Drobble.Shared.Kernel;
using MongoDB.Bson;

namespace Drobble.ReviewsRatings.Domain.Entities;

/// <summary>
/// Represents a customer review for a product.
/// </summary>
public class Review : Entity<ObjectId>
{
    /// <summary>
    /// The ID of the product being reviewed.
    /// </summary>
    public ObjectId ProductId { get; set; }

    /// <summary>
    /// The ID of the user who submitted the review.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// The star rating given by the user (e.g., 1-5).
    /// </summary>
    public int Rating { get; set; }

    /// <summary>
    /// The text content of the review.
    /// </summary>
    public string? Comment { get; set; }

    /// <summary>
    /// A list of URLs for images uploaded with the review.
    /// </summary>
    public List<string> Images { get; set; } = new();

    /// <summary>
    /// A flag indicating if the user purchased this product.
    /// This would be set by cross-referencing the Order service.
    /// </summary>
    public bool VerifiedPurchase { get; set; }

    /// <summary>
    /// The current moderation status of the review.
    /// </summary>
    public ModerationStatus ModerationStatus { get; set; } = ModerationStatus.Pending;
}
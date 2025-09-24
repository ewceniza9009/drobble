// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Domain/Entities/ModerationStatus.cs ----
namespace Drobble.ReviewsRatings.Domain.Entities;

/// <summary>
/// Represents the moderation state of a user-submitted review.
/// </summary>
public enum ModerationStatus
{
    /// <summary>
    /// The review is awaiting approval from an administrator.
    /// </summary>
    Pending,

    /// <summary>
    /// The review has been approved and is visible to the public.
    /// </summary>
    Approved,

    /// <summary>
    /// The review has been rejected and is not visible.
    /// </summary>
    Rejected
}
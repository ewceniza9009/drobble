using Drobble.Shared.Kernel;
using MongoDB.Bson;

namespace Drobble.ReviewsRatings.Domain.Entities;

public class Review : Entity<ObjectId>
{
    public ObjectId ProductId { get; set; }
    public Guid UserId { get; set; }
    public Guid? VendorId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public List<string> Images { get; set; } = new();
    public bool VerifiedPurchase { get; set; }
    public ModerationStatus ModerationStatus { get; set; } = ModerationStatus.Pending;
}
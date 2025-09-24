// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Application/Features/Reviews/Queries/ReviewDtos.cs ----
namespace Drobble.ReviewsRatings.Application.Features.Reviews.Queries;

public class ReviewDto
{
    public string Id { get; set; } = null!;
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    // We can add UserName later if needed by fetching from the User service
}

public class AverageRatingDto
{
    public double AverageRating { get; set; }
    public long ReviewCount { get; set; }
}

public class PaginatedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public long TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
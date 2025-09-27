using Drobble.ReviewsRatings.Application.Features.Reviews.Commands;
using Drobble.ReviewsRatings.Application.Features.Reviews.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/v1/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ReviewsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [Authorize] // Any logged-in user can create a review
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewCommand command)
    {
        var reviewId = await _mediator.Send(command);
        return CreatedAtAction(nameof(CreateReview), new { id = reviewId.ToString() }, new { reviewId });
    }

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetReviewsForProduct(string productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetReviewsByProductQuery(productId, page, pageSize));
        return Ok(result);
    }

    // --- ADMIN ENDPOINTS ---
    [HttpGet("admin/pending")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetPendingReviews([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetPendingReviewsQuery(page, pageSize));
        return Ok(result);
    }

    [HttpPut("admin/{reviewId}/moderate")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ModerateReview(string reviewId, [FromBody] ModerateReviewCommand command)
    {
        if (reviewId != command.ReviewId) return BadRequest();
        await _mediator.Send(command);
        return NoContent();
    }

    // --- VENDOR ENDPOINTS ---
    [HttpGet("vendor/pending")]
    [Authorize(Policy = "VendorOnly")]
    public async Task<IActionResult> GetVendorPendingReviews([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = new GetPendingReviewsQuery(page, pageSize, IsVendorRequest: true);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("vendor/{reviewId}/moderate")]
    [Authorize(Policy = "VendorOnly")]
    public async Task<IActionResult> ModerateVendorReview(string reviewId, [FromBody] ModerateReviewCommand command)
    {
        if (reviewId != command.ReviewId) return BadRequest();
        await _mediator.Send(command);
        return NoContent();
    }
}
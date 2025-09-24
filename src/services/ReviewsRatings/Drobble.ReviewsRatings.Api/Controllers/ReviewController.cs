// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Api/Controllers/ReviewsController.cs ----
using Drobble.ReviewsRatings.Application.Features.Reviews.Commands;
using Drobble.ReviewsRatings.Application.Features.Reviews.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Drobble.ReviewsRatings.Api.Controllers;

[ApiController]
[Route("api/v1/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReviewsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewCommand command)
    {
        try
        {
            var reviewId = await _mediator.Send(command);
            return CreatedAtAction(nameof(CreateReview), new { id = reviewId.ToString() }, new { reviewId });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetReviewsForProduct(string productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = new GetReviewsByProductQuery(productId, page, pageSize);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("product/{productId}/average-rating")]
    public async Task<IActionResult> GetAverageRatingForProduct(string productId)
    {
        var query = new GetAverageRatingQuery(productId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    // --- ADMIN ENDPOINTS ---

    [HttpGet("admin/reviews/pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingReviews([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = new GetPendingReviewsQuery(page, pageSize);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("reviews/{reviewId}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ModerateReview(string reviewId, [FromBody] bool approve)
    {
        var command = new ModerateReviewCommand(reviewId, approve);
        await _mediator.Send(command);
        return NoContent();
    }
}
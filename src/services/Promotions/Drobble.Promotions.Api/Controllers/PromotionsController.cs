// ---- File: src/services/Promotions/Drobble.Promotions.Api/Controllers/PromotionsController.cs ----
using Drobble.Promotions.Application.Features.Promotions.Commands;
using Drobble.Promotions.Application.Features.Promotions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/promotions")]
public class PromotionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PromotionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // Endpoint for the Shopping Cart to validate a promo code
    [HttpPost("validate")]
    [Authorize] // Should be protected so only logged-in users can check codes
    public async Task<IActionResult> ValidateCode([FromBody] ValidatePromoCodeQuery query)
    {
        var result = await _mediator.Send(query);
        return result.IsValid ? Ok(result) : BadRequest(result);
    }

    // --- ADMIN ENDPOINTS ---

    [HttpGet("admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllPromotions()
    {
        var result = await _mediator.Send(new GetAllPromotionsQuery());
        return Ok(result);
    }

    [HttpPost("admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreatePromotion([FromBody] CreatePromotionCommand command)
    {
        var promotionId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAllPromotions), new { id = promotionId }, command);
    }
}
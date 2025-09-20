using Drobble.ShoppingCart.Application.Features.Carts.Commands;
using Drobble.ShoppingCart.Application.Features.Carts.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/v1/[controller]")]
public class CartsController : ControllerBase
{
    private readonly IMediator _mediator;
    private const string SessionCookieName = "Drobble.SessionId";

    public CartsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // We only need a body for the product and quantity
    public record AddItemRequest(string ProductId, int Quantity);

    [HttpPost("items")]
    public async Task<IActionResult> AddItemToCart([FromBody] AddItemRequest request)
    {
        Guid? userId = null;
        string? sessionId = null;

        // Check if the user is authenticated via JWT
        if (User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var id))
            {
                userId = id;
            }
        }
        else // The user is a guest
        {
            sessionId = Request.Cookies[SessionCookieName];
            if (string.IsNullOrEmpty(sessionId))
            {
                // If no session cookie exists, create one
                sessionId = Guid.NewGuid().ToString();
                Response.Cookies.Append(SessionCookieName, sessionId, new CookieOptions
                {
                    HttpOnly = true, // Protects against XSS
                    Expires = DateTime.UtcNow.AddDays(7)
                });
            }
        }

        var command = new AddItemToCartCommand(request.ProductId, request.Quantity, userId, sessionId);
        var cartDto = await _mediator.Send(command);

        return Ok(cartDto);
    }

    [HttpDelete("items/{productId}")]
    public async Task<IActionResult> RemoveItemFromCart(string productId)
    {
        Guid? userId = null;
        string? sessionId = Request.Cookies[SessionCookieName];

        if (User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var id))
            {
                userId = id;
            }
        }

        if (userId is null && sessionId is null)
        {
            return BadRequest("No active cart session found.");
        }

        var command = new RemoveItemFromCartCommand(productId, userId, sessionId);
        var cartDto = await _mediator.Send(command);

        return Ok(cartDto);
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await _mediator.Send(new GetCartQuery());
        return cart is not null ? Ok(cart) : Ok(null); // Return OK with null if no cart exists
    }
}
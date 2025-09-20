using Drobble.UserManagement.Application.Features.Users.Commands;
using Drobble.UserManagement.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        try
        {
            var userId = await _mediator.Send(command);
            return CreatedAtAction(nameof(Register), new { id = userId }, new { UserId = userId });
        }
        catch (Exception ex)
        {
            // In a real app, you'd have more specific exception handling
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginUserQuery query)
    {
        try
        {
            //{
            //    "username": "gemini_user",
            //    "password": "SecurePassword123!"
            //}

            var token = await _mediator.Send(query);
            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { Error = ex.Message });
        }
    }
}
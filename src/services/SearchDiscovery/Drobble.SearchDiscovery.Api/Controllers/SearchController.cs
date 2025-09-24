// ---- File: src/services/SearchDiscovery/Api/Controllers/SearchController.cs ----
using Drobble.SearchDiscovery.Application.Features;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Drobble.SearchDiscovery.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SearchController : ControllerBase
{
    private readonly IMediator _mediator;

    public SearchController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(Enumerable.Empty<object>());
        }

        var query = new SearchProductsQuery(q);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
// ---- File: src/services/ProductCatalog/Api/Controllers/ProductsController.cs ----
using Drobble.ProductCatalog.Application.Features;
using Drobble.ProductCatalog.Application.Features.Commands;
using Drobble.ProductCatalog.Application.Features.Products.Commands;
using Drobble.ProductCatalog.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

[ApiController]
[Route("api/v1/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
    {
        var productId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetProductById), new { id = productId.ToString() }, command);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProduct(string id, [FromBody] UpdateProductCommand command)
    {
        // Ensure the ID from the route matches the ID in the command body
        if (id != command.Id)
        {
            return BadRequest("Route ID must match command ID.");
        }

        await _mediator.Send(command);
        return NoContent(); // 204 No Content is a standard success response for a PUT request
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductById(string id)
    {
        var query = new GetProductByIdQuery(id);
        var product = await _mediator.Send(query);
        return product is not null ? Ok(product) : NotFound();
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = new GetProductsQuery(page, pageSize);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("batch")]
    public async Task<IActionResult> GetProductsByIds([FromBody] IEnumerable<string> ids)
    {
        var query = new GetProductsByIdsQuery(ids);
        var products = await _mediator.Send(query);
        return Ok(products);
    }
}
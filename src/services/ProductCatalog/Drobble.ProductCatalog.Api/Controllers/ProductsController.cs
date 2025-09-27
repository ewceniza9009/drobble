using Drobble.ProductCatalog.Application.Features.Commands;
using Drobble.ProductCatalog.Application.Features.Products.Commands;
using Drobble.ProductCatalog.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/products")]
public class ProductsController : ControllerBase
{
    private readonly ILogger<ProductsController> _logger;
    private readonly IMediator _mediator;

    public ProductsController(ILogger<ProductsController> logger, IMediator mediator) 
    {
        _mediator = mediator;
        _logger = logger;
    }

    // --- PUBLIC ENDPOINTS ---
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductById(string id)
    {
        var product = await _mediator.Send(new GetProductByIdQuery(id));
        return product is not null ? Ok(product) : NotFound();
    }
    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetProductsQuery(page, pageSize));
        return Ok(result);
    }
    [HttpPost("batch")]
    public async Task<IActionResult> GetProductsByIds([FromBody] IEnumerable<string> ids)
    {
        var products = await _mediator.Send(new GetProductsByIdsQuery(ids));
        return Ok(products);
    }

    // --- ADMIN ENDPOINTS ---
    [HttpPost("admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
    {
        var productId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetProductById), new { id = productId.ToString() }, command);
    }

    [HttpPut("admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateProduct(string id, [FromBody] UpdateProductCommand command)
    {
        var updatedCommand = command with { Id = id };

        await _mediator.Send(updatedCommand);

        _logger.LogInformation($"Payload: {command.ToString()}");
        return NoContent();
    }

    // --- VENDOR ENDPOINTS ---
    [HttpGet("vendor")]
    [Authorize(Policy = "VendorOnly")]
    public async Task<IActionResult> GetVendorProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetVendorProductsQuery(page, pageSize));
        return Ok(result);
    }
    [HttpPost("vendor")]
    [Authorize(Policy = "VendorOnly")]
    public async Task<IActionResult> CreateVendorProduct([FromBody] CreateProductCommand command)
    {
        var productId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetProductById), new { id = productId.ToString() }, command);
    }
    [HttpPut("vendor/{id}")]
    [Authorize(Policy = "VendorOnly")]
    public async Task<IActionResult> UpdateVendorProduct(string id, [FromBody] UpdateProductCommand command)
    {
        var updatedCommand = command with { Id = id };

        await _mediator.Send(updatedCommand);
        return NoContent();
    }
    [HttpGet("vendor/ids")]
    [Authorize(Policy = "VendorOnly")]
    public async Task<IActionResult> GetVendorProductIds()
    {
        var ids = await _mediator.Send(new GetVendorProductIdsQuery());
        return Ok(ids);
    }
}
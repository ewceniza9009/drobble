using Drobble.ProductCatalog.Application.Features.Commands;
using Drobble.ProductCatalog.Application.Features.Products.Commands;
using Drobble.ProductCatalog.Application.Features.Products.Queries;
using Drobble.Shared.EventBus.Events;
using MassTransit;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/products")]
public class ProductsController : ControllerBase
{
    private readonly ILogger<ProductsController> _logger;
    private readonly IMediator _mediator;
    private readonly IPublishEndpoint _publishEndpoint; // --- 3. INJECT THE PUBLISH ENDPOINT ---

    public ProductsController(ILogger<ProductsController> logger, IMediator mediator, IPublishEndpoint publishEndpoint)
    {
        _mediator = mediator;
        _logger = logger;
        _publishEndpoint = publishEndpoint; // --- 4. ASSIGN IT ---
    }

    [HttpPost("admin/reindex")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ReindexAllProducts()
    {
        _logger.LogInformation("Re-index request received. Fetching all products from the database.");

        // --- THIS IS THE FIX ---
        var result = await _mediator.Send(new GetProductsQuery(1, int.MaxValue, null, null, null, null));
        var allProducts = result.Items;
        var total = result.Total;
        // --- END OF FIX ---

        if (!allProducts.Any())
        {
            return Ok("No products found to re-index.");
        }

        _logger.LogInformation("Found {TotalProducts} products. Publishing ProductsReindexRequestedEvent.", total);

        var productsToReindex = allProducts.Select(p => new ProductReindexData
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            ImageUrl = p.ImageUrls.FirstOrDefault()
        }).ToList();

        await _publishEndpoint.Publish(new ProductsReindexRequestedEvent
        {
            Products = productsToReindex
        });

        return Ok(new { Message = $"Re-indexing job for {total} products has been queued successfully." });
    }

    // --- PUBLIC ENDPOINTS ---
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductById(string id)
    {
        var product = await _mediator.Send(new GetProductByIdQuery(id));
        return product is not null ? Ok(product) : NotFound();
    }

    // Added 'categoryId' and 'exclude' parameters to handle more complex filtering.
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? isFeatured = null,
        [FromQuery] string? categoryId = null,
        [FromQuery] string? sort = null,
        [FromQuery] string? exclude = null)
    {
        // Pass all parameters to the MediatR query
        var result = await _mediator.Send(new GetProductsQuery(page, pageSize, isFeatured, categoryId, sort, exclude));
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
using Drobble.OrderManagement.Application.Features.Orders.Commands;
using Drobble.OrderManagement.Application.Features.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/v1/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IMediator mediator, ILogger<OrdersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    // --- THIS IS THE MODIFIED METHOD ---
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] JsonElement payload)
    {
        // 1. Log the raw JSON payload as a string to see exactly what we received.
        var rawJson = payload.GetRawText();
        _logger.LogWarning("RAW JSON PAYLOAD RECEIVED: {RawJson}", rawJson);

        // 2. Manually deserialize the JSON into our command object.
        var command = JsonSerializer.Deserialize<CreateOrderCommand>(rawJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true // Ensure camelCase from JS matches PascalCase in C#
        });

        if (command is null)
        {
            return BadRequest("Could not deserialize the command from the request body.");
        }

        // 3. Log the result of our manual deserialization.
        _logger.LogInformation("DESERIALIZED COMMAND: AppliedPromoCode = {PromoCode}, DiscountAmount = {DiscountAmount}", command.AppliedPromoCode, command.DiscountAmount);

        // 4. Send the command to the handler as before.
        var orderId = await _mediator.Send(command);
        var newOrderDto = await _mediator.Send(new GetOrderByIdQuery(orderId));

        return CreatedAtAction(nameof(GetOrderById), new { id = orderId }, newOrderDto);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var order = await _mediator.Send(new GetOrderByIdQuery(id));
        return order is not null ? Ok(order) : NotFound();
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var orders = await _mediator.Send(new GetMyOrdersQuery());
        return Ok(orders);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelMyOrder(Guid id)
    {
        await _mediator.Send(new CancelOrderCommand(id));
        return NoContent();
    }

    [HttpGet("admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var orders = await _mediator.Send(new GetAllOrdersQuery(page, pageSize));
        return Ok(orders);
    }

    [HttpPut("admin/{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusCommand command)
    {
        if (id != command.OrderId) return BadRequest("Mismatched Order ID.");
        await _mediator.Send(command);
        return NoContent();
    }

    public record ShipOrderRequest(string TrackingNumber);

    [HttpPost("admin/{id:guid}/ship")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ShipOrder(Guid id, [FromBody] ShipOrderRequest request)
    {
        await _mediator.Send(new ShipOrderCommand(id, request.TrackingNumber));
        return NoContent();
    }

    [HttpPost("admin/{id:guid}/cancel")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        await _mediator.Send(new CancelOrderCommand(id));
        return NoContent();
    }

    [HttpGet("vendor")]
    [Authorize(Policy = "VendorOnly")]
    public async Task<IActionResult> GetVendorOrders()
    {
        var orders = await _mediator.Send(new GetVendorOrdersQuery());
        return Ok(orders);
    }
}
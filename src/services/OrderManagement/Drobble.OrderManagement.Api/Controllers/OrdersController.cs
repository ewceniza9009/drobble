using Drobble.OrderManagement.Application.Features.Orders.Commands;
using Drobble.OrderManagement.Application.Features.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    public OrdersController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
    {
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

    // --- ENDPOINT FOR USERS TO CANCEL ---
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelMyOrder(Guid id)
    {
        // Note: The handler should verify that the calling user owns this order
        await _mediator.Send(new CancelOrderCommand(id));
        return NoContent();
    }

    // --- ADMIN ENDPOINTS ---
    [HttpGet("admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10) // Add pagination
    {
        var orders = await _mediator.Send(new GetAllOrdersQuery(page, pageSize));
        return Ok(orders);
    }

    // --- ENDPOINT FOR ADMINS TO UPDATE STATUS ---
    [HttpPut("admin/{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusCommand command)
    {
        if (id != command.OrderId) return BadRequest("Mismatched Order ID.");

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("admin/{id:guid}/cancel")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        await _mediator.Send(new CancelOrderCommand(id));
        return NoContent();
    }

    // --- VENDOR ENDPOINTS ---
    [HttpGet("vendor")]
    [Authorize(Policy = "VendorOnly")]
    public async Task<IActionResult> GetVendorOrders()
    {
        var orders = await _mediator.Send(new GetVendorOrdersQuery());
        return Ok(orders);
    }
}
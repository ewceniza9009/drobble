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
        // 1. This correctly creates the order and returns the new Guid.
        var orderId = await _mediator.Send(command);

        // 2. THE FIX: Use the new 'orderId' to fetch the full order details.
        //    This creates a complete order object to return to the client.
        var newOrderDto = await _mediator.Send(new GetOrderByIdQuery(orderId));

        // 3. Return a 201 Created status with the full newOrderDto in the response body.
        //    This object contains the 'id' property that the frontend needs.
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

    // --- ADMIN ENDPOINTS ---
    [HttpGet("admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _mediator.Send(new GetAllOrdersQuery());
        return Ok(orders);
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
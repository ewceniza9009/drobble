using Drobble.Payment.Application.Features;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/v1/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    public record CreateOrderRequest(Guid OrderId, string Gateway = "PayPal");

    [HttpPost("create-order")]
    public async Task<IActionResult> CreatePaymentOrder([FromBody] CreateOrderRequest request)
    {
        var command = new CreatePaymentOrderCommand(request.OrderId, Enum.Parse<Drobble.Payment.Domain.Entities.PaymentGateway>(request.Gateway));
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    public record CaptureOrderRequest(string GatewayOrderId);

    [HttpPost("capture-order")]
    public async Task<IActionResult> CapturePaymentOrder([FromBody] CaptureOrderRequest request)
    {
        var command = new CapturePaymentOrderCommand(request.GatewayOrderId);
        var success = await _mediator.Send(command);
        return success ? Ok(new { status = "Success" }) : BadRequest(new { status = "Failed" });
    }
}
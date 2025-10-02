using MediatR;

namespace Drobble.Payment.Application.Features;

public record CapturePaymentOrderCommand(string GatewayOrderId) : IRequest<bool>;
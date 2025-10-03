using MediatR;
using Drobble.Payment.Domain.Entities;

namespace Drobble.Payment.Application.Features;

public record CreatePaymentOrderCommand(Guid OrderId, PaymentGateway Gateway) : IRequest<CreatePaymentOrderResponse>;

public record CreatePaymentOrderResponse(string ApprovalUrl, string OrderId);
using MediatR;
using Drobble.Payment.Domain.Entities;

namespace Drobble.Payment.Application.Features;

// Command to create a payment order for a specific gateway
public record CreatePaymentOrderCommand(Guid OrderId, PaymentGateway Gateway) : IRequest<CreatePaymentOrderResponse>;

// DTO for the response, which will contain the approval URL for the frontend
public record CreatePaymentOrderResponse(string ApprovalUrl, string OrderId);
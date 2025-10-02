using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.Payment.Application.Contracts;

public record CreateOrderResponse(string ApprovalUrl, string GatewayOrderId);
public record CaptureOrderResponse(bool IsSuccess, string TransactionId);

public interface IPaymentGatewayService
{
    Task<CreateOrderResponse> CreateOrderAsync(decimal amount, string currency, Guid orderId, CancellationToken cancellationToken);
    Task<CaptureOrderResponse> CaptureOrderAsync(string gatewayOrderId, CancellationToken cancellationToken);
}
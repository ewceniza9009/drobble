using Drobble.Payment.Application.Contracts;
using Drobble.Payment.Domain.Entities;
using Drobble.Shared.EventBus.Events;
using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;
// This using alias is the critical fix for the name collision with PayPal's Transaction class.
using Transaction = Drobble.Payment.Domain.Entities.Transaction;

namespace Drobble.Payment.Application.Features;

public class CapturePaymentOrderCommandHandler : IRequestHandler<CapturePaymentOrderCommand, bool>
{
    private readonly IPaymentGatewayService _paymentGatewayService;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<CapturePaymentOrderCommandHandler> _logger;

    public CapturePaymentOrderCommandHandler(IPaymentGatewayService ps, ITransactionRepository tr, IPublishEndpoint pe, ILogger<CapturePaymentOrderCommandHandler> l)
    {
        _paymentGatewayService = ps;
        _transactionRepository = tr;
        _publishEndpoint = pe;
        _logger = l;
    }

    public async Task<bool> Handle(CapturePaymentOrderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Attempting to capture payment for Gateway Order ID: {GatewayOrderId}", request.GatewayOrderId);

        var transaction = await _transactionRepository.GetByGatewayTransactionIdAsync(request.GatewayOrderId, cancellationToken);

        if (transaction is null)
        {
            _logger.LogError("Could not find a matching transaction for Gateway Order ID: {GatewayOrderId}", request.GatewayOrderId);
            return false;
        }

        // Check if the transaction has already been captured successfully.
        // This makes the endpoint idempotent (safe to call multiple times).
        if (transaction.Status == PaymentStatus.Succeeded)
        {
            _logger.LogWarning("Received duplicate capture request for already succeeded Gateway Order ID: {GatewayOrderId}", request.GatewayOrderId);
            return true; // Return success without doing anything.
        }

        // 1. Capture the payment with the gateway
        var captureResponse = await _paymentGatewayService.CaptureOrderAsync(request.GatewayOrderId, cancellationToken);

        // 2. Update the transaction status and publish an event
        if (captureResponse.IsSuccess)
        {
            transaction.Status = PaymentStatus.Succeeded;
            await _transactionRepository.UpdateAsync(transaction, cancellationToken);

            await _publishEndpoint.Publish(new PaymentSucceededEvent { OrderId = transaction.OrderId }, cancellationToken);
            _logger.LogInformation("Payment Succeeded for OrderId: {OrderId}", transaction.OrderId);
            return true;
        }
        else
        {
            transaction.Status = PaymentStatus.Failed;
            transaction.FailureReason = "Capture failed at gateway.";
            await _transactionRepository.UpdateAsync(transaction, cancellationToken);

            await _publishEndpoint.Publish(new PaymentFailedEvent { OrderId = transaction.OrderId, Reason = "Capture failed." }, cancellationToken);
            _logger.LogError("Payment Failed for OrderId: {OrderId}", transaction.OrderId);
            return false;
        }
    }
}
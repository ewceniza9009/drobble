using Drobble.Payment.Application.Contracts;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
// This using alias is the critical fix for the name collision with PayPal's Transaction class.
using Transaction = Drobble.Payment.Domain.Entities.Transaction;
using Drobble.Payment.Domain.Entities;

namespace Drobble.Payment.Application.Features;

public class CreatePaymentOrderCommandHandler : IRequestHandler<CreatePaymentOrderCommand, CreatePaymentOrderResponse>
{
    private readonly IPaymentGatewayService _paymentGatewayService;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IOrderService _orderService;
    private readonly ILogger<CreatePaymentOrderCommandHandler> _logger;

    public CreatePaymentOrderCommandHandler(
        IPaymentGatewayService paymentGatewayService,
        ITransactionRepository transactionRepository,
        IOrderService orderService,
        ILogger<CreatePaymentOrderCommandHandler> logger)
    {
        _paymentGatewayService = paymentGatewayService;
        _transactionRepository = transactionRepository;
        _orderService = orderService;
        _logger = logger;
    }

    public async Task<CreatePaymentOrderResponse> Handle(CreatePaymentOrderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating payment order for OrderId: {OrderId} with Gateway: {Gateway}", request.OrderId, request.Gateway);

        var orderDetails = await _orderService.GetOrderDetailsAsync(request.OrderId, cancellationToken);
        if (orderDetails is null)
        {
            _logger.LogError("Order with Id {OrderId} not found.", request.OrderId);
            throw new Exception("Order not found.");
        }

        var gatewayResponse = await _paymentGatewayService.CreateOrderAsync(
            orderDetails.TotalAmount,
            orderDetails.Currency,
            request.OrderId,
            cancellationToken);

        _logger.LogInformation("PayPal order {PayPalOrderId} created for Drobble OrderId: {OrderId}", gatewayResponse.GatewayOrderId, request.OrderId);

        var newTransaction = new Transaction
        {
            OrderId = request.OrderId,
            Amount = orderDetails.TotalAmount,
            Currency = orderDetails.Currency,
            Status = PaymentStatus.Pending,
            Gateway = request.Gateway,
            GatewayTransactionId = gatewayResponse.GatewayOrderId
        };

        await _transactionRepository.AddAsync(newTransaction, cancellationToken);
        _logger.LogInformation("Transaction log created for OrderId: {OrderId}", request.OrderId);

        return new CreatePaymentOrderResponse(gatewayResponse.ApprovalUrl, gatewayResponse.GatewayOrderId);
    }
}
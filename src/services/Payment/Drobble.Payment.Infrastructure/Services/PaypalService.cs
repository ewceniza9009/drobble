using Drobble.Payment.Application.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using PayPalOrder = PayPalCheckoutSdk.Orders.Order;

namespace Drobble.Payment.Infrastructure.Services;

public class PayPalService : IPaymentGatewayService
{
    private readonly PayPalHttpClient _payPalClient;
    private readonly IConfiguration _config;
    private readonly ILogger<PayPalService> _logger;

    public PayPalService(IConfiguration config, ILogger<PayPalService> logger)
    {
        _config = config;
        _logger = logger;

        PayPalEnvironment environment = _config["PayPal:Mode"] == "Live"
            ? new LiveEnvironment(_config["PayPal:ClientId"], _config["PayPal:ClientSecret"])
            : new SandboxEnvironment(_config["PayPal:ClientId"], _config["PayPal:ClientSecret"]);

        _payPalClient = new PayPalHttpClient(environment);
    }

    public async Task<CreateOrderResponse> CreateOrderAsync(decimal amount, string currency, Guid orderId, CancellationToken cancellationToken)
    {
        var orderRequest = new OrderRequest()
        {
            CheckoutPaymentIntent = "CAPTURE",
            PurchaseUnits = new List<PurchaseUnitRequest>
            {
                new()
                {
                    AmountWithBreakdown = new AmountWithBreakdown
                    {
                        CurrencyCode = currency,
                        Value = amount.ToString("F2")
                    }
                }
            },
            ApplicationContext = new ApplicationContext
            {
                ReturnUrl = _config["PayPal:ReturnUrl"],
                CancelUrl = _config["PayPal:CancelUrl"],
                BrandName = "Drobble",
                ShippingPreference = "NO_SHIPPING"
            }
        };

        var request = new OrdersCreateRequest();
        request.Prefer("return=representation");
        request.RequestBody(orderRequest);

        try
        {
            var response = await _payPalClient.Execute(request);
            var result = response.Result<PayPalOrder>();

            var approvalLink = result.Links.FirstOrDefault(link => link.Rel == "approve");
            if (approvalLink is null)
            {
                throw new Exception("Could not find PayPal approval link.");
            }

            return new CreateOrderResponse(approvalLink.Href, result.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating PayPal order for OrderId: {OrderId}", orderId);
            throw;
        }
    }

    public async Task<CaptureOrderResponse> CaptureOrderAsync(string gatewayOrderId, CancellationToken cancellationToken)
    {
        var request = new OrdersCaptureRequest(gatewayOrderId);
        request.RequestBody(new OrderActionRequest());

        try
        {
            var response = await _payPalClient.Execute(request);
            var result = response.Result<PayPalOrder>();

            var capture = result.PurchaseUnits.FirstOrDefault()?.Payments?.Captures?.FirstOrDefault();
            if (result.Status == "COMPLETED" && capture != null)
            {
                _logger.LogInformation("Successfully captured PayPal order {GatewayOrderId}", gatewayOrderId);
                return new CaptureOrderResponse(true, capture.Id);
            }

            _logger.LogWarning("PayPal capture status was not 'COMPLETED' for {GatewayOrderId}. Status: {Status}", gatewayOrderId, result.Status);
            return new CaptureOrderResponse(false, string.Empty);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error capturing PayPal order {GatewayOrderId}", gatewayOrderId);
            return new CaptureOrderResponse(false, string.Empty);
        }
    }
}
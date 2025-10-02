using Drobble.Shared.Kernel;
using System;

namespace Drobble.Payment.Domain.Entities;

public class Transaction : Entity<Guid>
{
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public PaymentGateway Gateway { get; set; }
    public string GatewayTransactionId { get; set; } = string.Empty; // e.g., PayPal's Order ID
    public string? FailureReason { get; set; }
}
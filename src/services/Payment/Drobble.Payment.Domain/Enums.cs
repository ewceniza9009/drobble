namespace Drobble.Payment.Domain.Entities;

public enum PaymentStatus
{
    Pending,
    Succeeded,
    Failed,
    Refunded,
    Captured // Added for PayPal flow
}

public enum PaymentGateway
{
    PayPal,
    PayMaya,
    GCash,
    Stripe // Keep for future expansion
}
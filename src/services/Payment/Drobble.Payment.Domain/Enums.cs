namespace Drobble.Payment.Domain.Entities;

public enum PaymentStatus
{
    Pending,
    Succeeded,
    Failed,
    Refunded,
    Captured
}

public enum PaymentGateway
{
    PayPal,
    PayMaya,
    GCash,
    Stripe,
    CashOnDelivery    
}
using System;

namespace Drobble.Shared.EventBus.Events;

public record PaymentSucceededEvent
{
    public Guid OrderId { get; init; }
}
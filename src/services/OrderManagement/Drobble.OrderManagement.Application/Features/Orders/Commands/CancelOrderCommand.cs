using MediatR;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public record CancelOrderCommand(Guid OrderId) : IRequest;

// Handler would contain logic to change order status, publish OrderCancelledEvent, etc.
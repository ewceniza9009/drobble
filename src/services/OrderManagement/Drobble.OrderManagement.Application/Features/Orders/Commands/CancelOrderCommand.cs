using MediatR;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public record CancelOrderCommand(Guid OrderId) : IRequest;
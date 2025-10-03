using MediatR;
using System;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public record ShipOrderCommand(Guid OrderId, string TrackingNumber) : IRequest;
using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http; // Add this
using System;
using System.Linq;
using System.Security.Claims; // Add this
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CreateOrderCommandHandler(IOrderRepository orderRepository, IHttpContextAccessor httpContextAccessor)
    {
        _orderRepository = orderRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // Get the User ID from the JWT claims
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new Exception("User ID not found in token.");
        }

        var order = new Order
        {
            UserId = userId, // Use the ID from the token
            Currency = request.Currency,
            Status = OrderStatus.Pending
        };

        foreach (var itemDto in request.Items)
        {
            order.OrderItems.Add(new OrderItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                Price = itemDto.Price
            });
        }

        order.TotalAmount = order.OrderItems.Sum(item => item.Price * item.Quantity);

        await _orderRepository.AddAsync(order, cancellationToken);

        return order.Id;
    }
}
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.Payment.Application.Contracts;

public interface IOrderService
{
    Task<OrderDetailsDto?> GetOrderDetailsAsync(Guid orderId, CancellationToken cancellationToken);
}

// Data Transfer Object for getting order details from the OrderManagement service
public record OrderDetailsDto(Guid Id, decimal TotalAmount, string Currency);
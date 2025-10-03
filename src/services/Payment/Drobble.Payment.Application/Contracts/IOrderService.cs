using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.Payment.Application.Contracts;

public interface IOrderService
{
    Task<OrderDetailsDto?> GetOrderDetailsAsync(Guid orderId, CancellationToken cancellationToken);
}

public record OrderDetailsDto(Guid Id, decimal TotalAmount, string Currency);
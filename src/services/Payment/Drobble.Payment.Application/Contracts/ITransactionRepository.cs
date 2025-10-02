using Drobble.Payment.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.Payment.Application.Contracts;

public interface ITransactionRepository
{
    Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default);
    Task<Transaction?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<Transaction?> GetByGatewayTransactionIdAsync(string gatewayTransactionId, CancellationToken cancellationToken = default);
    Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken = default);
}

using Drobble.Payment.Application.Contracts;
using Drobble.Payment.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.Payment.Infrastructure.Persistence;

public class TransactionRepository : ITransactionRepository
{
    private readonly PaymentDbContext _context;

    public TransactionRepository(PaymentDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        await _context.Transactions.AddAsync(transaction, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<Transaction?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return _context.Transactions.FirstOrDefaultAsync(t => t.OrderId == orderId, cancellationToken);
    }

    public Task<Transaction?> GetByGatewayTransactionIdAsync(string gatewayTransactionId, CancellationToken cancellationToken = default)
    {
        return _context.Transactions.FirstOrDefaultAsync(t => t.GatewayTransactionId == gatewayTransactionId, cancellationToken);
    }

    public async Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

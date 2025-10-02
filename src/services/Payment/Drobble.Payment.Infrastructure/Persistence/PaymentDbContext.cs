using Drobble.Payment.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Drobble.Payment.Infrastructure.Persistence;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
    {
    }

    public DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.HasIndex(t => t.OrderId);
            entity.HasIndex(t => t.GatewayTransactionId);
        });
    }
}
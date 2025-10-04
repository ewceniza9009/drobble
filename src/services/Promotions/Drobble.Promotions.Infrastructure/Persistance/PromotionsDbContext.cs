// ---- File: src/services/Promotions/Drobble.Promotions.Infrastructure/Persistence/PromotionsDbContext.cs ----
using Drobble.Promotions.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace Drobble.Promotions.Infrastructure.Persistence;

public class PromotionsDbContext : DbContext
{
    public PromotionsDbContext(DbContextOptions<PromotionsDbContext> options) : base(options)
    {
    }

    public DbSet<Promotion> Promotions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Promotion>(builder =>
        {
            builder.HasKey(p => p.Id);
            builder.HasIndex(p => p.Code).IsUnique(); // Ensure promotion codes are unique

            // Configure the PromotionRule object to be stored as a JSONB column in PostgreSQL
            builder.Property(p => p.Rules).HasColumnType("jsonb");
        });
    }
}
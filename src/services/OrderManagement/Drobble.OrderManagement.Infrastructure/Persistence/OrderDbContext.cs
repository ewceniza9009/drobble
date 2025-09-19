// src/services/OrderManagement/Drobble.OrderManagement.Infrastructure/Persistence/OrderDbContext.cs
using Drobble.OrderManagement.Domain.Entities;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Drobble.OrderManagement.Infrastructure.Persistence;

public class OrderDbContext : DbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options)
    {
    }

    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Shipping> Shipping { get; set; }
}
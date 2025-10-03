using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Infrastructure.Persistence;

public class OrderRepository : IOrderRepository
{
    private readonly OrderDbContext _context;

    public OrderRepository(OrderDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        await _context.Orders.AddAsync(order, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.ShippingDetails)         
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderItems)
            .Include(o => o.ShippingDetails)         
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Order> Orders, int TotalCount)> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var totalCount = await _context.Orders.CountAsync(cancellationToken);

        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.ShippingDetails)         
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (orders, totalCount);
    }

    public async Task UpdateAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetOrdersByProductIdsAsync(IEnumerable<string> productIds, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.ShippingDetails)         
            .Where(o => o.OrderItems.Any(oi => productIds.Contains(oi.ProductId)))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
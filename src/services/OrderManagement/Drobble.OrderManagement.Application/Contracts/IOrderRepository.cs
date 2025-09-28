using Drobble.OrderManagement.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Application.Contracts;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
    Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Order> Orders, int TotalCount)> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task UpdateAsync(Order order, CancellationToken cancellationToken = default);
    Task<IEnumerable<Order>> GetOrdersByProductIdsAsync(IEnumerable<string> productIds, CancellationToken cancellationToken = default);
}
// src/services/OrderManagement/Drobble.OrderManagement.Application/Contracts/IOrderRepository.cs
using Drobble.OrderManagement.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Application.Contracts;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
}
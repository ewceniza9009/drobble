using Drobble.ShoppingCart.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ShoppingCart.Application.Contracts
{
    public interface ICartRepository
    {
        Task<Cart?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Cart?> GetBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default);
        Task<Cart> CreateAsync(Cart cart, CancellationToken cancellationToken = default);
        Task UpdateAsync(Cart cart, CancellationToken cancellationToken = default);
    }
}
// ---- File: src/services/Promotions/Drobble.Promotions.Application/Contracts/IPromotionRepository.cs ----
using Drobble.Promotions.Domain.Entities;

namespace Drobble.Promotions.Application.Contracts;

public interface IPromotionRepository
{
    Task AddAsync(Promotion promotion, CancellationToken cancellationToken = default);
    Task UpdateAsync(Promotion promotion, CancellationToken cancellationToken = default);
    Task<Promotion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IEnumerable<Promotion>> GetAllAsync(CancellationToken cancellationToken = default);
}
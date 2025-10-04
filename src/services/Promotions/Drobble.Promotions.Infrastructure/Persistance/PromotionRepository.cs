// ---- File: src/services/Promotions/Drobble.Promotions.Infrastructure/Persistence/PromotionRepository.cs ----
using Drobble.Promotions.Application.Contracts;
using Drobble.Promotions.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Drobble.Promotions.Infrastructure.Persistence;

public class PromotionRepository : IPromotionRepository
{
    private readonly PromotionsDbContext _context;

    public PromotionRepository(PromotionsDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Promotion promotion, CancellationToken cancellationToken = default)
    {
        await _context.Promotions.AddAsync(promotion, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Promotion promotion, CancellationToken cancellationToken = default)
    {
        _context.Promotions.Update(promotion);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Promotion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Promotions.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Promotions.FirstOrDefaultAsync(p => p.Code.ToUpper() == code.ToUpper(), cancellationToken);
    }

    public async Task<IEnumerable<Promotion>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Promotions.OrderByDescending(p => p.CreatedAt).ToListAsync(cancellationToken);
    }
}
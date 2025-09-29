using Drobble.ProductCatalog.Domain.Entities;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Contracts;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default);
    Task AddAsync(Product product, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Product> Products, int Total)> GetAllAsync(int page, int pageSize, bool? isFeatured, string? categoryId, string? excludeId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetByIdsAsync(IEnumerable<ObjectId> ids, CancellationToken cancellationToken = default);
    Task UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Product> Products, int Total)> GetByVendorIdAsync(Guid vendorId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetIdsByVendorIdAsync(Guid vendorId, CancellationToken cancellationToken = default);
}
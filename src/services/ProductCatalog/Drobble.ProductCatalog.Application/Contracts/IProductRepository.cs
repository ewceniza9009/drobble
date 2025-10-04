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

    Task AddCategoryAsync(Category category, CancellationToken cancellationToken = default);
    Task<Category?> GetCategoryByIdAsync(ObjectId id, CancellationToken cancellationToken = default);
    Task UpdateCategoryAsync(Category category, CancellationToken cancellationToken = default);
    Task DeleteCategoryAsync(ObjectId id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Category>> GetAllCategoriesAsync(CancellationToken cancellationToken = default);
    Task<bool> HasCategoriesAsync(CancellationToken cancellationToken = default);     
}
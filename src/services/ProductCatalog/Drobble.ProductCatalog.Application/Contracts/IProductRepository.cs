// src/services/ProductCatalog/Drobble.ProductCatalog.Application/Contracts/IProductRepository.cs
using Drobble.ProductCatalog.Domain.Entities;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Contracts;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default);
    Task AddAsync(Product product, CancellationToken cancellationToken = default);
    // We will add other methods like UpdateAsync, GetAllAsync, etc. later
}
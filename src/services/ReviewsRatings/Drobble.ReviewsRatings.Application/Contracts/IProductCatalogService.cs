using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ReviewsRatings.Application.Contracts;

/// <summary>
/// Defines the contract for fetching essential product data from the Product Catalog service.
/// </summary>
public interface IProductCatalogService
{
    /// <summary>
    /// Retrieves a simplified product representation by its ID.
    /// </summary>
    Task<ProductDto?> GetProductByIdAsync(string productId, CancellationToken cancellationToken = default);
}

/// <summary>
/// A lean DTO representing the product data needed by the Reviews service.
/// </summary>
public record ProductDto(string Id, Guid? VendorId);

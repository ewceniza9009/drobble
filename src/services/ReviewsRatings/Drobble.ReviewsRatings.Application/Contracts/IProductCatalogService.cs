using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ReviewsRatings.Application.Contracts;

public interface IProductCatalogService
{
    Task<ProductDto?> GetProductByIdAsync(string productId, CancellationToken cancellationToken = default);
}

public record ProductDto(string Id, Guid? VendorId);

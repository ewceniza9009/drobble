// ---- File: src/services/OrderManagement/Application/Contracts/IProductCatalogService.cs ----
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Application.Contracts;

public interface IProductCatalogService
{
    Task<IEnumerable<ProductDto>> GetProductsByIdsAsync(IEnumerable<string> productIds, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetProductIdsByVendorAsync(Guid vendorId, CancellationToken cancellationToken = default);
}

public record ProductDto(string Id, string Name, decimal Price);
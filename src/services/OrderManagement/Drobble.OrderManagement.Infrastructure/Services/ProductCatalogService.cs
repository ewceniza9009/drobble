// ---- File: src/services/OrderManagement/Infrastructure/Services/ProductCatalogService.cs ----
using Drobble.OrderManagement.Application.Contracts;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.OrderManagement.Infrastructure.Services;

public class ProductCatalogService : IProductCatalogService
{
    private readonly HttpClient _httpClient;

    public ProductCatalogService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByIdsAsync(IEnumerable<string> productIds, CancellationToken cancellationToken = default)
    {
        // This endpoint path matches the one defined in the ProductCatalog API
        var response = await _httpClient.PostAsJsonAsync("api/v1/products/batch", productIds, cancellationToken);

        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<IEnumerable<ProductDto>>(cancellationToken: cancellationToken) ?? new List<ProductDto>();
    }
}
using Drobble.ShoppingCart.Application.Contracts;
using MongoDB.Bson;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ShoppingCart.Infrastructure.Services;

public class ProductCatalogService : IProductCatalogService
{
    private readonly HttpClient _httpClient;

    public ProductCatalogService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ProductDto?> GetProductByIdAsync(ObjectId productId, CancellationToken cancellationToken = default)
    {
        try
        {
            // The actual URL will be like: http://productcatalog-api/api/v1/products/{id}
            return await _httpClient.GetFromJsonAsync<ProductDto>($"api/v1/products/{productId}", cancellationToken);
        }
        catch (HttpRequestException) // Handles 404 Not Found, etc.
        {
            return null;
        }
    }
}
using Drobble.ReviewsRatings.Application.Contracts;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ReviewsRatings.Infrastructure.Services;

public class ProductCatalogService : IProductCatalogService
{
    private readonly HttpClient _httpClient;

    public ProductCatalogService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ProductDto?> GetProductByIdAsync(string productId, CancellationToken cancellationToken = default)
    {
        try
        {
            // The request URI is relative to the BaseAddress configured in Program.cs
            return await _httpClient.GetFromJsonAsync<ProductDto>($"api/v1/products/{productId}", cancellationToken);
        }
        catch (HttpRequestException) // Handles 404 Not Found, network issues, etc.
        {
            return null;
        }
    }
}

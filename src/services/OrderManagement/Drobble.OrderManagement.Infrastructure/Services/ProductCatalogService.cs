using Drobble.OrderManagement.Application.Contracts;
using Microsoft.AspNetCore.Http; 
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Drobble.OrderManagement.Infrastructure.Services;

public class ProductCatalogService : IProductCatalogService
{
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;

    // Inject IHttpContextAccessor to access the current request's headers
    public ProductCatalogService(HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
    {
        _httpClient = httpClient;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByIdsAsync(IEnumerable<string> productIds, CancellationToken cancellationToken = default)
    {
        // Add auth token to outgoing request
        AddAuthorizationHeader();
        var response = await _httpClient.PostAsJsonAsync("api/v1/products/batch", productIds, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<IEnumerable<ProductDto>>(cancellationToken: cancellationToken) ?? new List<ProductDto>();
    }

    // This is the missing implementation
    public async Task<IEnumerable<string>> GetProductIdsByVendorAsync(Guid vendorId, CancellationToken cancellationToken = default)
    {
        // Add auth token to outgoing request
        AddAuthorizationHeader();
        var response = await _httpClient.GetAsync("api/v1/products/vendor/ids", cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<IEnumerable<string>>(cancellationToken: cancellationToken) ?? Enumerable.Empty<string>();
    }

    private void AddAuthorizationHeader()
    {
        var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
        if (token is not null)
        {
            _httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);
        }
    }
}
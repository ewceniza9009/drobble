using Drobble.Payment.Application.Contracts;
using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.Payment.Infrastructure.Services;

// Concrete implementation for fetching order details from the OrderManagement microservice.
public class OrderService : IOrderService
{
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public OrderService(HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
    {
        _httpClient = httpClient;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<OrderDetailsDto?> GetOrderDetailsAsync(Guid orderId, CancellationToken cancellationToken)
    {
        // Get the original Authorization header from the incoming request.
        var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();

        // If the token exists, add it to the outgoing request to the Order service.
        if (!string.IsNullOrEmpty(token))
        {
            _httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);
        }

        try
        {
            // The request URI is relative to the BaseAddress configured in Program.cs
            return await _httpClient.GetFromJsonAsync<OrderDetailsDto>($"api/v1/orders/{orderId}", cancellationToken);
        }
        catch (HttpRequestException) // Handles 401 Unauthorized, 404 Not Found, etc.
        {
            return null;
        }
    }
}

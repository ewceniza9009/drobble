using Drobble.OrderManagement.Application.Contracts;
using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Drobble.OrderManagement.Infrastructure.Services;

public class UserManagementService : IUserManagementService
{
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserManagementService(HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
    {
        _httpClient = httpClient;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IEnumerable<UserData>> GetUsersByIdsAsync(IEnumerable<Guid> userIds, CancellationToken cancellationToken = default)
    {
        // 1. Get the original Authorization header from the incoming request.
        var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();

        // 2. If the token exists, add it to the outgoing request.
        if (!string.IsNullOrEmpty(token))
        {
            _httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);
        }

        // This is an internal service-to-service call, so we don't forward the user's JWT.
        // In production, you would use a secure method like client credentials or a managed identity.
        var response = await _httpClient.PostAsJsonAsync("api/v1/users/batch", userIds, cancellationToken);
        response.EnsureSuccessStatusCode(); // This will no longer throw a 401 error
        return await response.Content.ReadFromJsonAsync<IEnumerable<UserData>>(cancellationToken: cancellationToken) ?? Enumerable.Empty<UserData>();
    }
}
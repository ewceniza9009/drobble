using Drobble.ReviewsRatings.Application.Contracts;
using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Drobble.ReviewsRatings.Infrastructure.Services;

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
        var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();

        if (!string.IsNullOrEmpty(token))
        {
            _httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);
        }

        var response = await _httpClient.PostAsJsonAsync("api/v1/users/batch", userIds, cancellationToken);
        response.EnsureSuccessStatusCode();         
        return await response.Content.ReadFromJsonAsync<IEnumerable<UserData>>(cancellationToken: cancellationToken) ?? Enumerable.Empty<UserData>();
    }
}
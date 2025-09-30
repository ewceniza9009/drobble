// tests/OrderManagement.IntegrationTests/OrdersControllerTests.cs
using Drobble.OrderManagement.Application.Features.Orders.Commands;
using Drobble.OrderManagement.Application.Features.Orders.Queries;
using Drobble.OrderManagement.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Testcontainers.PostgreSql;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Server;
using Xunit;

namespace Drobble.OrderManagement.IntegrationTests;

public class OrdersControllerTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder()
        .WithImage("postgres:16")
        .WithDatabase("drobble-test-db")
        .WithUsername("testuser")
        .WithPassword("testpass")
        .Build();

    private readonly WireMockServer _mockServer;
    private WebApplicationFactory<Program> _factory = null!;
    private HttpClient _client = null!;

    // Test data
    private readonly Guid _testUserId = Guid.Parse("a1b2c3d4-e5f6-7788-9900-aabbccddeeff");
    private const string TestProductId = "60c72b2f9b1d8e001c8e4d8b";
    private readonly TestJwtTokenGenerator _tokenGenerator = new();


    public OrdersControllerTests()
    {
        _mockServer = WireMockServer.Start();
    }

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();

        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll(typeof(DbContextOptions<OrderDbContext>));
                    services.AddDbContext<OrderDbContext>(options =>
                        options.UseNpgsql(_dbContainer.GetConnectionString()));

                    services.AddHttpClient("ProductCatalogService_Test", c => c.BaseAddress = new Uri(_mockServer.Urls[0]));
                    services.AddHttpClient("UserManagementService_Test", c => c.BaseAddress = new Uri(_mockServer.Urls[0]));
                });
            });

        _client = _factory.CreateClient();

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
        await dbContext.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _dbContainer.DisposeAsync();
        _mockServer.Stop();
        _factory.Dispose();
    }

    private void SetupMockProductApi()
    {
        var productResponse = new[]
        {
            new { Id = TestProductId, Name = "Mock Product", Price = 150.00m }
        };

        _mockServer
            .Given(Request.Create().WithPath("/api/v1/products/batch").UsingPost())
            .RespondWith(Response.Create()
                .WithStatusCode(200)
                .WithHeader("Content-Type", "application/json")
                .WithBody(JsonSerializer.Serialize(productResponse)));
    }

    [Fact]
    public async Task CreateOrder_WithValidData_ReturnsCreated()
    {
        // Arrange
        SetupMockProductApi();
        var token = _tokenGenerator.GenerateToken(_testUserId, "User");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var command = new CreateOrderCommand(
            new List<Application.Features.Orders.Commands.OrderItemDto>
            {
                new(TestProductId, 2, 0)
            }, "PHP");

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/orders", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdOrder = await response.Content.ReadFromJsonAsync<OrderDto>();
        createdOrder.Should().NotBeNull();
        createdOrder!.UserId.Should().Be(_testUserId);
        createdOrder.TotalAmount.Should().Be(300.00m);
        createdOrder.Items.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetMyOrders_WhenAuthenticated_ReturnsUserOrders()
    {
        // Arrange
        var token = _tokenGenerator.GenerateToken(_testUserId, "User");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Seed an order for the user
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
            // CORRECTED: Use constructor and initializers for allowed properties
            var orderToSeed = new Domain.Entities.Order()
            {
                UserId = _testUserId,
                TotalAmount = 500,
                Currency = "PHP"
            };
            context.Orders.Add(orderToSeed);
            await context.SaveChangesAsync();
        }

        // Act
        var response = await _client.GetAsync("/api/v1/orders/my-orders");

        // Assert
        response.EnsureSuccessStatusCode();
        var orders = await response.Content.ReadFromJsonAsync<List<OrderDto>>();
        orders.Should().NotBeNull().And.HaveCount(1);
        orders!.First().UserId.Should().Be(_testUserId);
    }

    [Fact]
    public async Task GetAllOrders_AsAdmin_ReturnsAllOrders()
    {
        // Arrange
        var adminToken = _tokenGenerator.GenerateToken(Guid.NewGuid(), "Admin");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync("/api/v1/orders/admin");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetAllOrders_AsRegularUser_ReturnsForbidden()
    {
        // Arrange
        var userToken = _tokenGenerator.GenerateToken(_testUserId, "User");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync("/api/v1/orders/admin");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}


// Helper class to generate JWTs for tests
public class TestJwtTokenGenerator
{
    private const string TestSecretKey = "ThisIsASecretKeyAndItNeedsToBeLongEnoughForHS256";

    public string GenerateToken(Guid userId, string role)
    {
        var securityKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(TestSecretKey));
        var credentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(securityKey, Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim("iss", "Drobble.UserManagement"),
            new Claim("aud", "Drobble.Platform")
        };

        var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
            issuer: "Drobble.UserManagement",
            audience: "Drobble.Platform",
            claims: claims,
            expires: DateTime.Now.AddMinutes(30),
            signingCredentials: credentials);

        return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
    }
}
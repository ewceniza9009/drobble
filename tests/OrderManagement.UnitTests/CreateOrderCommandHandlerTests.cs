using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Application.Features.Orders.Commands;
using Drobble.OrderManagement.Domain.Entities;
using FluentAssertions;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Moq;
using System.Security.Claims;

namespace Drobble.OrderManagement.UnitTests.Features.Orders.Commands;

public class CreateOrderCommandHandlerTests
{
    private readonly Mock<IOrderRepository> _orderRepositoryMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly Mock<IProductCatalogService> _productCatalogServiceMock;
    private readonly Mock<IPublishEndpoint> _publishEndpointMock;
    private readonly CreateOrderCommandHandler _handler;

    public CreateOrderCommandHandlerTests()
    {
        _orderRepositoryMock = new Mock<IOrderRepository>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _productCatalogServiceMock = new Mock<IProductCatalogService>();
        _publishEndpointMock = new Mock<IPublishEndpoint>();

        _handler = new CreateOrderCommandHandler(
            _orderRepositoryMock.Object,
            _httpContextAccessorMock.Object,
            _productCatalogServiceMock.Object,
            _publishEndpointMock.Object);
    }

    private void SetupUserClaims(Guid userId)
    {
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = claimsPrincipal };
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateOrderAndPublishEvent()
    {
        // Arrange
        var userId = Guid.NewGuid();
        SetupUserClaims(userId);

        var productId1 = "prod-001";
        var command = new CreateOrderCommand(
            new List<Application.Features.Orders.Commands.OrderItemDto>
            {
                new(productId1, 2, 0) // Price is fetched from service
            }, "USD");

        var productDetails = new List<ProductDto>
        {
            new(productId1, "Test Product", 99.99m)
        };

        _productCatalogServiceMock
            .Setup(s => s.GetProductsByIdsAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(productDetails);

        // Act
        var orderId = await _handler.Handle(command, CancellationToken.None);

        // Assert
        orderId.Should().NotBeEmpty();

        _orderRepositoryMock.Verify(
            r => r.AddAsync(It.Is<Order>(o =>
                o.UserId == userId &&
                o.TotalAmount == 199.98m && // 2 * 99.99
                o.OrderItems.First().ProductId == productId1
            ), It.IsAny<CancellationToken>()),
            Times.Once);

        _publishEndpointMock.Verify(
            p => p.Publish(It.IsAny<Drobble.Shared.EventBus.Events.OrderCreatedEvent>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenProductNotFound_ShouldThrowException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        SetupUserClaims(userId);

        var command = new CreateOrderCommand(
            new List<Application.Features.Orders.Commands.OrderItemDto>
            {
                new("non-existent-product", 1, 0)
            }, "USD");

        _productCatalogServiceMock
            .Setup(s => s.GetProductsByIdsAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ProductDto>()); // Return empty list

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenUserIsNotAuthenticated_ShouldThrowException()
    {
        // Arrange
        // No user claims are set up
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext()); // User is not authenticated

        var command = new CreateOrderCommand(new List<Application.Features.Orders.Commands.OrderItemDto>(), "USD");

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command, CancellationToken.None));
        exception.Message.Should().Be("User ID not found in token.");
    }
}
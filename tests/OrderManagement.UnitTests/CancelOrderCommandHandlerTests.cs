using Drobble.OrderManagement.Application.Contracts;
using Drobble.OrderManagement.Application.Features.Orders.Commands;
using Drobble.OrderManagement.Domain.Entities;
using Drobble.Shared.EventBus.Events;
using FluentAssertions;
using MassTransit;
using Moq;

namespace Drobble.OrderManagement.UnitTests.Features.Orders.Commands;

public class CancelOrderCommandHandlerTests
{
    private readonly Mock<IOrderRepository> _orderRepositoryMock;
    private readonly Mock<IPublishEndpoint> _publishEndpointMock;
    private readonly CancelOrderCommandHandler _handler;

    public CancelOrderCommandHandlerTests()
    {
        _orderRepositoryMock = new Mock<IOrderRepository>();
        _publishEndpointMock = new Mock<IPublishEndpoint>();
        _handler = new CancelOrderCommandHandler(_orderRepositoryMock.Object, _publishEndpointMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCancellableOrder_ShouldUpdateStatusAndPublishEvent()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var order = new Order { Status = OrderStatus.Pending };
        _orderRepositoryMock.Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>())).ReturnsAsync(order);

        var command = new CancelOrderCommand(orderId);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        order.Status.Should().Be(OrderStatus.Cancelled);
        _orderRepositoryMock.Verify(r => r.UpdateAsync(order, It.IsAny<CancellationToken>()), Times.Once);
        _publishEndpointMock.Verify(p => p.Publish(It.IsAny<OrderCancelledEvent>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithShippedOrder_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var order = new Order { Status = OrderStatus.Shipped };
        _orderRepositoryMock.Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        var command = new CancelOrderCommand(orderId);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithNonExistentOrder_ShouldThrowException()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        _orderRepositoryMock.Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>())).ReturnsAsync((Order)null);
        var command = new CancelOrderCommand(orderId);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command, CancellationToken.None));
    }
}
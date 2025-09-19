// src/services/OrderManagement/Drobble.OrderManagement.Application/Features/Orders/Queries/OrderDto.cs
using System;
using System.Collections.Generic;

namespace Drobble.OrderManagement.Application.Features.Orders.Queries;

public class OrderDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Status { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public string ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
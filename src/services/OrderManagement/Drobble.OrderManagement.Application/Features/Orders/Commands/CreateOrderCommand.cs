using MediatR;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Drobble.OrderManagement.Application.Features.Orders.Commands;

public class CreateOrderCommand : IRequest<Guid>
{
    public List<OrderItemDto> Items { get; set; } = new();
    public string Currency { get; set; } = "PHP";
    public ShippingAddressDto ShippingAddress { get; set; } = null!;
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal ShippingCost { get; set; }

    [JsonPropertyName("appliedPromoCode")]
    public string? AppliedPromoCode { get; set; }

    [JsonPropertyName("discountAmount")]
    public decimal DiscountAmount { get; set; }
}

public record OrderItemDto(string ProductId, int Quantity, decimal Price);

public record ShippingAddressDto(string FullName, string AddressLine, string City, string State, string ZipCode, string Country);
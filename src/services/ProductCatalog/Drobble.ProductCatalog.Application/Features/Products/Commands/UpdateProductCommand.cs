using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Commands;

public record UpdateProductCommand(
    string Id,
    string Name,
    string Description,
    decimal Price,
    int Stock,
    string CategoryId,
    List<string>? ImageUrls,
    string? Sku,
    decimal Weight,
    bool IsFeatured) : IRequest;       
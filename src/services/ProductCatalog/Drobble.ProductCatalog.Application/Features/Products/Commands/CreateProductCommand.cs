using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price,
    int Stock,
    string CategoryId,
    List<string> ImageUrls,
    string? Sku,
    decimal Weight,
    bool IsFeatured) : IRequest<ObjectId>;       
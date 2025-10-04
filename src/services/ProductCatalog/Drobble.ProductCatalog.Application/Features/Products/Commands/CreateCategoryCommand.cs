using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

public record CreateCategoryCommand(
    string Name,
    string Description,
    string Slug,
    string? ParentId) : IRequest<ObjectId>;
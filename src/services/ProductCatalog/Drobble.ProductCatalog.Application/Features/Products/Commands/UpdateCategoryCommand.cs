using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

public record UpdateCategoryCommand(
    string Id,
    string Name,
    string Description,
    string Slug,
    string? ParentId) : IRequest;
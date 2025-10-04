using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public record CategoryDto(
    string Id,
    string Name,
    string Description,
    string Slug,
    string? ParentId
);

public record GetAllCategoriesQuery() : IRequest<IEnumerable<CategoryDto>>;
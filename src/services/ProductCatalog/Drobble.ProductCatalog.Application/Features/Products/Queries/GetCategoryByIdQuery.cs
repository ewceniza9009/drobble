using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public record GetCategoryByIdQuery(string Id) : IRequest<CategoryDto?>;
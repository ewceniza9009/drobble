using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public record GetProductByIdQuery(string Id) : IRequest<ProductDto?>;     
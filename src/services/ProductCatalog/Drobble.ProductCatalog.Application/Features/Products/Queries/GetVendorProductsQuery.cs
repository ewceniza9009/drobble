using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public record GetVendorProductsQuery(int Page = 1, int PageSize = 20) : IRequest<PaginatedResult<ProductDto>>;
using Drobble.ProductCatalog.Application.Contracts;
using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public record GetProductsQuery(int Page, int PageSize) : IRequest<PaginatedResult<ProductDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PaginatedResult<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public GetProductsQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var (products, total) = await _productRepository.GetAllAsync(request.Page, request.PageSize, cancellationToken);

        var productDtos = products.Select(p => new ProductDto
        {
            Id = p.Id.ToString(),
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            CategoryId = p.CategoryId.ToString(),
            IsActive = p.IsActive
        }).ToList();

        return new PaginatedResult<ProductDto>
        {
            Items = productDtos,
            Total = total,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
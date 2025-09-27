// ---- File: src/services/ProductCatalog/Application/Features/Products/Queries/GetProductsQuery.cs ----
using Drobble.ProductCatalog.Application.Contracts;
using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

// FIX: Added CategoryId and ExcludeId to the query record
public record GetProductsQuery(int Page, int PageSize, bool? IsFeatured, string? CategoryId, string? ExcludeId) : IRequest<PaginatedResult<ProductDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PaginatedResult<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public GetProductsQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        // FIX: Pass all filter parameters to the repository
        var (products, total) = await _productRepository.GetAllAsync(request.Page, request.PageSize, request.IsFeatured, request.CategoryId, request.ExcludeId, cancellationToken);

        var productDtos = products.Select(p => new ProductDto
        {
            Id = p.Id.ToString(),
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            CategoryId = p.CategoryId.ToString(),
            IsActive = p.IsActive,
            ImageUrl = p.ImageUrls.FirstOrDefault() // Map the first image
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
using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Application.Features;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public class GetVendorProductsQueryHandler : IRequestHandler<GetVendorProductsQuery, PaginatedResult<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetVendorProductsQueryHandler(IProductRepository productRepository, IHttpContextAccessor httpContextAccessor)
    {
        _productRepository = productRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(GetVendorProductsQuery request, CancellationToken cancellationToken)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var vendorId))
        {
            throw new UnauthorizedAccessException("Cannot determine vendor from token.");
        }

        var (products, total) = await _productRepository.GetByVendorIdAsync(vendorId, request.Page, request.PageSize, cancellationToken);

        var productDtos = products.Select(p => new ProductDto
        {
            Id = p.Id.ToString(),
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            CategoryId = p.CategoryId.ToString(),
            IsActive = p.IsActive,
            ImageUrls = p.ImageUrls
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
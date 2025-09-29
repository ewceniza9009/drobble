using Drobble.ProductCatalog.Application.Contracts;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    private readonly IProductRepository _productRepository;

    public GetProductByIdQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(ObjectId.Parse(request.Id), cancellationToken);

        if (product is null)
        {
            return null;
        }

        return new ProductDto
        {
            Id = product.Id.ToString(),
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            CategoryId = product.CategoryId.ToString(),
            VendorId = product.VendorId,    
            IsActive = product.IsActive,
            ImageUrl = product.ImageUrls.FirstOrDefault()
        };
    }
}

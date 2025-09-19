// src/services/ProductCatalog/Drobble.ProductCatalog.Application/Features/Products/Queries/GetProductByIdQueryHandler.cs
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
        // 1. Fetch the domain entity from the database using the repository
        var product = await _productRepository.GetByIdAsync(ObjectId.Parse(request.Id), cancellationToken);

        if (product is null)
        {
            return null;
        }

        // 2. Map the domain entity to the DTO
        return new ProductDto
        {
            Id = product.Id.ToString(),
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            CategoryId = product.CategoryId.ToString(),
            IsActive = product.IsActive
        };
    }
}
// src/services/ProductCatalog/Drobble.ProductCatalog.Application/Features/Products/Commands/CreateProductCommandHandler.cs
using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Domain.Entities;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ObjectId>
{
    private readonly IProductRepository _productRepository;

    // Inject the repository contract
    public CreateProductCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ObjectId> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Create the domain entity from the command's data
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            CategoryId = ObjectId.Parse(request.CategoryId)
        };

        // 2. Use the repository to persist the new product
        await _productRepository.AddAsync(product, cancellationToken);

        // 3. Return the ID of the newly created product
        return product.Id;
    }
}
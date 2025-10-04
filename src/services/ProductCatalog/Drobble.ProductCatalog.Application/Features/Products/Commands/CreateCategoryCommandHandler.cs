using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Domain.Entities;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, ObjectId>
{
    private readonly IProductRepository _productRepository;

    public CreateCategoryCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ObjectId> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Name = request.Name,
            Description = request.Description,
            Slug = request.Slug,
            ParentId = !string.IsNullOrEmpty(request.ParentId) ? ObjectId.Parse(request.ParentId) : null
        };

        await _productRepository.AddCategoryAsync(category, cancellationToken);

        return category.Id;
    }
}
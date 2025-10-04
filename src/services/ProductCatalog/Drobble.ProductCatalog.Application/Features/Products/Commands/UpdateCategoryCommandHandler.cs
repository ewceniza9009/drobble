using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Domain.Entities;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand>
{
    private readonly IProductRepository _productRepository;

    public UpdateCategoryCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var categoryId = ObjectId.Parse(request.Id);
        var category = await _productRepository.GetCategoryByIdAsync(categoryId, cancellationToken);

        if (category is null)
        {
            throw new Exception($"Category with Id {request.Id} not found.");
        }

        category.Name = request.Name;
        category.Description = request.Description;
        category.Slug = request.Slug;
        category.ParentId = !string.IsNullOrEmpty(request.ParentId) ? ObjectId.Parse(request.ParentId) : null;
        category.UpdatedAt = DateTime.UtcNow;

        await _productRepository.UpdateCategoryAsync(category, cancellationToken);
    }
}
using Drobble.ProductCatalog.Application.Contracts;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto?>
{
    private readonly IProductRepository _productRepository;

    public GetCategoryByIdQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<CategoryDto?> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(request.Id, out var categoryId))
        {
            return null;
        }

        var category = await _productRepository.GetCategoryByIdAsync(categoryId, cancellationToken);

        if (category is null)
        {
            return null;
        }

        return new CategoryDto(
            category.Id.ToString(),
            category.Name,
            category.Description,
            category.Slug,
            category.ParentId?.ToString()
        );
    }
}
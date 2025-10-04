using Drobble.ProductCatalog.Application.Contracts;
using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public class GetAllCategoriesQueryHandler : IRequestHandler<GetAllCategoriesQuery, IEnumerable<CategoryDto>>
{
    private readonly IProductRepository _productRepository;

    public GetAllCategoriesQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _productRepository.GetAllCategoriesAsync(cancellationToken);

        return categories.Select(c => new CategoryDto(
            c.Id.ToString(),
            c.Name,
            c.Description,
            c.Slug,
            c.ParentId?.ToString()
        )).ToList();
    }
}
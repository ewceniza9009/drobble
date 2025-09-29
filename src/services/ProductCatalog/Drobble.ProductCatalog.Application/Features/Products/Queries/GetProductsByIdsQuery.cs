using Drobble.ProductCatalog.Application.Contracts;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public record GetProductsByIdsQuery(IEnumerable<string> Ids) : IRequest<IEnumerable<ProductDto>>;

public class GetProductsByIdsQueryHandler : IRequestHandler<GetProductsByIdsQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public GetProductsByIdsQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<ProductDto>> Handle(GetProductsByIdsQuery request, CancellationToken cancellationToken)
    {
        var objectIds = request.Ids.Select(ObjectId.Parse);
        var products = await _productRepository.GetByIdsAsync(objectIds, cancellationToken);

        return products.Select(p => new ProductDto
        {
            Id = p.Id.ToString(),
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            CategoryId = p.CategoryId.ToString(),
            IsActive = p.IsActive,
            ImageUrl = p.ImageUrls.FirstOrDefault()     
        });
    }
}
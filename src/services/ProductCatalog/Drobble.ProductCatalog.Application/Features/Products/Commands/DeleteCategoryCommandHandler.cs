using Drobble.ProductCatalog.Application.Contracts;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand>
{
    private readonly IProductRepository _productRepository;

    public DeleteCategoryCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var categoryId = ObjectId.Parse(request.Id);
        await _productRepository.DeleteCategoryAsync(categoryId, cancellationToken);
    }
}
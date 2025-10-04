using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Application.Features.Commands;
using Drobble.Shared.EventBus.Events;
using MassTransit;
using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand>
{
    private readonly IProductRepository _productRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public UpdateProductCommandHandler(IProductRepository productRepository, IPublishEndpoint publishEndpoint)
    {
        _productRepository = productRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(ObjectId.Parse(request.Id), cancellationToken);
        if (product is null)
        {
            throw new Exception($"Product with Id {request.Id} not found.");
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.CategoryId = ObjectId.Parse(request.CategoryId);
        product.ImageUrls = request.ImageUrls ?? product.ImageUrls;
        product.UpdatedAt = DateTime.UtcNow;
        product.Sku = request.Sku;
        product.Weight = request.Weight;
        product.IsFeatured = request.IsFeatured;

        await _productRepository.UpdateAsync(product, cancellationToken);

        await _publishEndpoint.Publish(new ProductUpdatedEvent
        {
            Id = product.Id.ToString(),
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            ImageUrl = product.ImageUrls.FirstOrDefault()
        }, cancellationToken);
    }
}
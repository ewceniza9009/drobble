// ---- File: src/services/ProductCatalog/Application/Features/Products/Commands/UpdateProductCommandHandler.cs ----
using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Application.Features.Commands;
using Drobble.Shared.EventBus.Events;
using MassTransit;
using MediatR;
using MongoDB.Bson; // <-- ADD THIS LINE

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
        // 1. Find the existing product
        var product = await _productRepository.GetByIdAsync(ObjectId.Parse(request.Id), cancellationToken);
        if (product is null)
        {
            // In a real app, you would throw a specific NotFoundException
            throw new Exception($"Product with Id {request.Id} not found.");
        }

        // 2. Update its properties
        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.CategoryId = ObjectId.Parse(request.CategoryId);
        product.ImageUrls = new List<string> { request.ImageUrl ?? "" };
        product.UpdatedAt = DateTime.UtcNow;

        // 3. Save the changes back to the database
        await _productRepository.UpdateAsync(product, cancellationToken);

        // 4. Publish an event to notify other services (like Search) of the update
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
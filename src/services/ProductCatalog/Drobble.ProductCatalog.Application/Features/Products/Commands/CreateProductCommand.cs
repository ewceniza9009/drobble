// src/services/ProductCatalog/Drobble.ProductCatalog.Application/Features/Products/Commands/CreateProductCommand.cs
using MediatR;
using MongoDB.Bson;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

// Using a record for a simple, immutable data carrier
public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price,
    int Stock,
    string CategoryId) : IRequest<ObjectId>; // This command will return the new product's ID
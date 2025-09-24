// ---- File: src/services/ProductCatalog/Application/Features/Products/Commands/UpdateProductCommand.cs ----
using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Commands;

// Using a record for the command's data
public record UpdateProductCommand(
    string Id,
    string Name,
    string Description,
    decimal Price,
    int Stock,
    string CategoryId,
    string? ImageUrl) : IRequest; 


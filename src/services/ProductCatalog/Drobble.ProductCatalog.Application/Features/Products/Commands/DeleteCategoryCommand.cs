using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Commands;

public record DeleteCategoryCommand(string Id) : IRequest;
// src/services/ProductCatalog/Drobble.ProductCatalog.Application/Features/Products/Queries/GetProductByIdQuery.cs
using MediatR;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public record GetProductByIdQuery(string Id) : IRequest<ProductDto?>; // Returns a nullable DTO
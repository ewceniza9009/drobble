using MediatR;
using Drobble.ProductCatalog.Application.Contracts;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public record GetVendorProductIdsQuery() : IRequest<IEnumerable<string>>;

public class GetVendorProductIdsQueryHandler : IRequestHandler<GetVendorProductIdsQuery, IEnumerable<string>>
{
    private readonly IProductRepository _productRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetVendorProductIdsQueryHandler(IProductRepository productRepository, IHttpContextAccessor httpContextAccessor)
    {
        _productRepository = productRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IEnumerable<string>> Handle(GetVendorProductIdsQuery request, CancellationToken cancellationToken)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var vendorId))
        {
            throw new UnauthorizedAccessException("Cannot determine vendor from token.");
        }

        return await _productRepository.GetIdsByVendorIdAsync(vendorId, cancellationToken);
    }
}
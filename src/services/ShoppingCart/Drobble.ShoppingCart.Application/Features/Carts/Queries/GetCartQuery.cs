using MediatR;
using System;
using Drobble.ShoppingCart.Application.Contracts;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace Drobble.ShoppingCart.Application.Features.Carts.Queries;

public record GetCartQuery : IRequest<CartDto?>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto?>
{
    private readonly ICartRepository _cartRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private const string SessionCookieName = "Drobble.SessionId";

    public GetCartQueryHandler(ICartRepository cartRepository, IHttpContextAccessor httpContextAccessor)
    {
        _cartRepository = cartRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<CartDto?> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext is null) return null;

        Guid? userId = null;
        var userIdClaim = httpContext.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var id))
        {
            userId = id;
        }

        var sessionId = httpContext.Request.Cookies[SessionCookieName];

        var cart = userId.HasValue
            ? await _cartRepository.GetByUserIdAsync(userId.Value, cancellationToken)
            : (sessionId != null ? await _cartRepository.GetBySessionIdAsync(sessionId, cancellationToken) : null);

        if (cart is null)
        {
            return null;
        }

        return new CartDto
        {
            Id = cart.Id.ToString(),
            Total = cart.Total,
            Items = cart.Items.Select(i => new CartItemDto
            {
                ProductId = i.ProductId.ToString(),
                Quantity = i.Quantity,
                PriceAtAdd = i.PriceAtAdd
            }).ToList()
        };
    }
}
// ---- File: src/services/ShoppingCart/Application/Features/Carts/Commands/MergeCartCommand.cs ----
using Drobble.ShoppingCart.Application.Contracts;
using Drobble.ShoppingCart.Application.Mappings;
using Drobble.ShoppingCart.Domain.Entities; // Required for CartItem
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ShoppingCart.Application.Features.Carts.Commands;

public record MergeCartCommand : IRequest<CartDto?>;

public class MergeCartCommandHandler : IRequestHandler<MergeCartCommand, CartDto?>
{
    private readonly ICartRepository _cartRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private const string SessionCookieName = "Drobble.SessionId";

    public MergeCartCommandHandler(ICartRepository cartRepository, IHttpContextAccessor httpContextAccessor)
    {
        _cartRepository = cartRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<CartDto?> Handle(MergeCartCommand request, CancellationToken cancellationToken)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var userIdClaim = httpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        var sessionId = httpContext?.Request.Cookies[SessionCookieName];

        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId) || string.IsNullOrEmpty(sessionId))
        {
            return null;
        }

        var guestCart = await _cartRepository.GetBySessionIdAsync(sessionId, cancellationToken);
        if (guestCart is null)
        {
            var userCartIfExists = await _cartRepository.GetByUserIdAsync(userId, cancellationToken);
            return userCartIfExists?.ToDto();
        }

        var userCart = await _cartRepository.GetByUserIdAsync(userId, cancellationToken);

        if (userCart is null)
        {
            guestCart.UserId = userId;
            guestCart.SessionId = null;
            await _cartRepository.UpdateAsync(guestCart, cancellationToken);
            return guestCart.ToDto();
        }

        // --- MERGE LOGIC ---
        foreach (var guestItem in guestCart.Items)
        {
            var userItem = userCart.Items.FirstOrDefault(i => i.ProductId == guestItem.ProductId);
            if (userItem != null)
            {
                // Item exists, so just update the quantity
                userItem.Quantity += guestItem.Quantity;
            }
            else
            {
                // ** THE FIX IS HERE **
                // Item doesn't exist, so create a NEW item instead of moving the old one.
                userCart.Items.Add(new CartItem
                {
                    ProductId = guestItem.ProductId,
                    Quantity = guestItem.Quantity,
                    PriceAtAdd = guestItem.PriceAtAdd,
                    AddedAt = guestItem.AddedAt
                });
            }
        }

        await _cartRepository.UpdateAsync(userCart, cancellationToken);
        await _cartRepository.DeleteAsync(guestCart.Id, cancellationToken);

        return userCart.ToDto();
    }
}
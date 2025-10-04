// ---- File: src/services/Promotions/Drobble.Promotions.Application/Features/Promotions/Queries/ValidatePromoCodeQueryHandler.cs ----
using Drobble.Promotions.Application.Contracts;
using Drobble.Promotions.Domain.Enums;
using MediatR;

namespace Drobble.Promotions.Application.Features.Promotions.Queries;

public class ValidatePromoCodeQueryHandler : IRequestHandler<ValidatePromoCodeQuery, ValidationResponse>
{
    private readonly IPromotionRepository _promotionRepository;

    public ValidatePromoCodeQueryHandler(IPromotionRepository promotionRepository)
    {
        _promotionRepository = promotionRepository;
    }

    public async Task<ValidationResponse> Handle(ValidatePromoCodeQuery request, CancellationToken cancellationToken)
    {
        var promotion = await _promotionRepository.GetByCodeAsync(request.Code, cancellationToken);

        // Rule 1: Does the promotion exist and is it active?
        if (promotion is null || !promotion.IsActive)
        {
            return new ValidationResponse(false, 0, "Invalid promotion code.");
        }

        // Rule 2: Is the promotion currently valid (date range)?
        var now = DateTime.UtcNow;
        if (now < promotion.StartDate || (promotion.EndDate.HasValue && now > promotion.EndDate))
        {
            return new ValidationResponse(false, 0, "This promotion is not currently active.");
        }

        // Rule 3: Has the usage limit been reached?
        if (promotion.TimesUsed >= promotion.UsageLimit)
        {
            return new ValidationResponse(false, 0, "This promotion has reached its usage limit.");
        }

        // Rule 4: Does the cart meet the minimum purchase amount?
        if (promotion.Rules.MinPurchaseAmount.HasValue && request.Context.TotalAmount < promotion.Rules.MinPurchaseAmount.Value)
        {
            return new ValidationResponse(false, 0, $"A minimum purchase of {promotion.Rules.MinPurchaseAmount:C} is required.");
        }

        // (Future rule) Rule 5: Is the promotion exclusive to certain users?
        // if (promotion.Rules.ExclusiveUserIds.Any() && !promotion.Rules.ExclusiveUserIds.Contains(userId)) ...

        // Calculate discount
        decimal discountAmount = 0;
        if (promotion.DiscountType == DiscountType.Percentage)
        {
            discountAmount = request.Context.TotalAmount * (promotion.Value / 100);
        }
        else if (promotion.DiscountType == DiscountType.FixedAmount)
        {
            discountAmount = promotion.Value;
        }

        return new ValidationResponse(true, discountAmount, "Promotion applied successfully!");
    }
}
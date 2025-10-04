// ---- File: src/services/Promotions/Drobble.Promotions.Application/Features/Promotions/Queries/GetAllPromotionsQueryHandler.cs ----
using Drobble.Promotions.Application.Contracts;
using MediatR;

namespace Drobble.Promotions.Application.Features.Promotions.Queries;

public class GetAllPromotionsQueryHandler : IRequestHandler<GetAllPromotionsQuery, IEnumerable<PromotionDto>>
{
    private readonly IPromotionRepository _promotionRepository;

    public GetAllPromotionsQueryHandler(IPromotionRepository promotionRepository)
    {
        _promotionRepository = promotionRepository;
    }

    public async Task<IEnumerable<PromotionDto>> Handle(GetAllPromotionsQuery request, CancellationToken cancellationToken)
    {
        var promotions = await _promotionRepository.GetAllAsync(cancellationToken);

        return promotions.Select(p => new PromotionDto(
            p.Id,
            p.Name,
            p.Code,
            p.PromotionType.ToString(),
            p.DiscountType.ToString(),
            p.Value,
            p.Rules,
            p.StartDate,
            p.EndDate,
            p.UsageLimit,
            p.TimesUsed,
            p.IsActive
        )).ToList();
    }
}
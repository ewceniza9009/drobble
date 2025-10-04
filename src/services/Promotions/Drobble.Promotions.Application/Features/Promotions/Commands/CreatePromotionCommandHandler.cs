// ---- File: src/services/Promotions/Drobble.Promotions.Application/Features/Promotions/Commands/CreatePromotionCommandHandler.cs ----
using Drobble.Promotions.Application.Contracts;
using Drobble.Promotions.Domain.Entities;
using MediatR;

namespace Drobble.Promotions.Application.Features.Promotions.Commands;

public class CreatePromotionCommandHandler : IRequestHandler<CreatePromotionCommand, Guid>
{
    private readonly IPromotionRepository _promotionRepository;

    public CreatePromotionCommandHandler(IPromotionRepository promotionRepository)
    {
        _promotionRepository = promotionRepository;
    }

    public async Task<Guid> Handle(CreatePromotionCommand request, CancellationToken cancellationToken)
    {
        var existingPromo = await _promotionRepository.GetByCodeAsync(request.Code, cancellationToken);
        if (existingPromo != null)
        {
            throw new InvalidOperationException($"A promotion with code '{request.Code}' already exists.");
        }

        var promotion = new Promotion
        {
            Name = request.Name,
            Description = request.Description,
            Code = request.Code,
            PromotionType = request.PromotionType,
            DiscountType = request.DiscountType,
            Value = request.Value,
            Rules = request.Rules,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            UsageLimit = request.UsageLimit,
            IsActive = request.IsActive
        };

        await _promotionRepository.AddAsync(promotion, cancellationToken);

        return promotion.Id;
    }
}
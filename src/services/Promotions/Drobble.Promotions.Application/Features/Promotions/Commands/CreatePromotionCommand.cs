// ---- File: src/services/Promotions/Drobble.Promotions.Application/Features/Promotions/Commands/CreatePromotionCommand.cs ----
using Drobble.Promotions.Domain.Enums;
using Drobble.Promotions.Domain.ValueObjects;
using MediatR;

namespace Drobble.Promotions.Application.Features.Promotions.Commands;

public record CreatePromotionCommand(
    string Name,
    string Description,
    string Code,
    PromotionType PromotionType,
    DiscountType DiscountType,
    decimal Value,
    PromotionRule Rules,
    DateTime StartDate,
    DateTime? EndDate,
    int UsageLimit,
    bool IsActive) : IRequest<Guid>;
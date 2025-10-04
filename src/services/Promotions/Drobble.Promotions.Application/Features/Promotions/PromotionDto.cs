// ---- File: src/services/Promotions/Drobble.Promotions.Application/Features/Promotions/PromotionDto.cs ----
using Drobble.Promotions.Domain.Enums;
using Drobble.Promotions.Domain.ValueObjects;

namespace Drobble.Promotions.Application.Features.Promotions;

public record PromotionDto(
    Guid Id,
    string Name,
    string Code,
    string PromotionType,
    string DiscountType,
    decimal Value,
    PromotionRule Rules,
    DateTime StartDate,
    DateTime? EndDate,
    int UsageLimit,
    int TimesUsed,
    bool IsActive);
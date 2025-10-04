// ---- File: src/services/Promotions/Drobble.Promotions.Domain/Enums.cs ----
namespace Drobble.Promotions.Domain.Enums;

public enum PromotionType
{
    Code,       // Applied manually by entering a code (e.g., "SAVE10")
    Automatic   // Applied automatically if conditions are met (e.g., a site-wide sale)
}

public enum DiscountType
{
    Percentage,     // A percentage off the total (e.g., 10%)
    FixedAmount     // A fixed amount off the total (e.g., $5.00)
}
// ---- File: src/services/Promotions/Drobble.Promotions.Domain/ValueObjects/PromotionRule.cs ----
namespace Drobble.Promotions.Domain.ValueObjects;

public class PromotionRule
{
    /// <summary>
    /// The minimum purchase amount required for the promotion to be valid.
    /// </summary>
    public decimal? MinPurchaseAmount { get; set; }

    /// <summary>
    /// List of Product IDs this promotion applies to. If empty, it applies to all.
    /// </summary>
    public List<string> ApplicableProductIds { get; set; } = new();

    /// <summary>
    /// List of Category IDs this promotion applies to. If empty, it applies to all.
    /// </summary>
    public List<string> ApplicableCategoryIds { get; set; } = new();

    /// <summary>
    /// A list of User IDs this promotion is exclusive to. If empty, it's available to all users.
    /// </summary>
    public List<Guid> ExclusiveUserIds { get; set; } = new();
}
// ---- File: src/services/Promotions/Drobble.Promotions.Domain/Entities/Promotion.cs ----
using Drobble.Promotions.Domain.Enums;
using Drobble.Promotions.Domain.ValueObjects;
using Drobble.Shared.Kernel;

namespace Drobble.Promotions.Domain.Entities;

public class Promotion : Entity<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // e.g., "SUMMER25"
    public PromotionType PromotionType { get; set; } // Automatic or Code-based
    public DiscountType DiscountType { get; set; } // Percentage or Fixed Amount
    public decimal Value { get; set; } // The actual discount value (e.g., 25.00 for % or 500.00 for fixed)
    public PromotionRule Rules { get; set; } = new(); // Complex conditions stored as JSON
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; } // Nullable for promotions that don't expire
    public int UsageLimit { get; set; } = 1; // How many times a code can be used in total
    public int TimesUsed { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}
public class ProductSeedDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? VendorId { get; set; } // JSON string representation of a Guid
    public string CategorySlug { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public string? Sku { get; set; }
    public decimal Weight { get; set; }
}
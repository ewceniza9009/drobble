namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public class ProductDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string CategoryId { get; set; } = string.Empty;
    public Guid? VendorId { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public string? Sku { get; set; }
    public decimal Weight { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}
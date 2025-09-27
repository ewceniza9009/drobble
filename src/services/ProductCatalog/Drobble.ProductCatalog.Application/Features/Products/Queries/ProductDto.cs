namespace Drobble.ProductCatalog.Application.Features.Products.Queries;

public class ProductDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string CategoryId { get; set; }
    public Guid? VendorId { get; set; } // Expose VendorId
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }
}

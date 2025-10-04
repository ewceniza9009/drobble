
// Temporary DTO for handling string-based ParentId from JSON
public class CategorySeedDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Slug { get; set; }
    public string? ParentId { get; set; }
}

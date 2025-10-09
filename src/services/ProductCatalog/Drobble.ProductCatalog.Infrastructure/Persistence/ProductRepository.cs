using Drobble.ProductCatalog.Application.Contracts;
using Drobble.ProductCatalog.Domain.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ProductCatalog.Infrastructure.Persistence;

public class ProductRepository : IProductRepository
{
    private readonly IMongoCollection<Product> _productsCollection;
    private readonly IMongoCollection<Category> _categoriesCollection;

    public ProductRepository(IOptions<MongoDbSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
        _productsCollection = mongoDatabase.GetCollection<Product>(nameof(Product).ToLower() + "s");
        _categoriesCollection = mongoDatabase.GetCollection<Category>(nameof(Category).ToLower() + "s");
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _productsCollection.InsertOneAsync(product, null, cancellationToken);
    }

    public async Task<(IEnumerable<Product> Products, int Total)> GetAllAsync(int page, int pageSize, bool? isFeatured, string? categoryId, string? sort, string? excludeId, CancellationToken cancellationToken = default)
    {
        var builder = Builders<Product>.Filter;
        var filter = builder.Eq(p => p.IsActive, true);

        if (isFeatured.HasValue)
        {
            filter &= builder.Eq(p => p.IsFeatured, isFeatured.Value);
        }

        if (!string.IsNullOrEmpty(categoryId) && ObjectId.TryParse(categoryId, out var catId))
        {
            filter &= builder.Eq(p => p.CategoryId, catId);
        }

        if (!string.IsNullOrEmpty(excludeId) && ObjectId.TryParse(excludeId, out var exId))
        {
            filter &= builder.Ne(p => p.Id, exId);
        }

        SortDefinition<Product> sortDefinition = null;

        switch (sort?.ToLower())
        {
            case "newest":
                sortDefinition = Builders<Product>.Sort.Descending(p => p.CreatedAt);
                break;
            case "price_asc":
                sortDefinition = Builders<Product>.Sort.Ascending(p => p.Price);
                break;
            case "price_desc":
                sortDefinition = Builders<Product>.Sort.Descending(p => p.Price);
                break;
            default:
                sortDefinition = Builders<Product>.Sort.Descending(p => p.CreatedAt);
                break;
        }

        var total = await _productsCollection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var findQuery = _productsCollection.Find(filter);

        if (sortDefinition != null)
        {
            findQuery = findQuery.Sort(sortDefinition);
        }

        var products = await findQuery
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        return (products, (int)total);
    }

    public async Task<Product?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default)
    {
        return await _productsCollection.Find(p => p.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetByIdsAsync(IEnumerable<ObjectId> ids, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Product>.Filter.In(p => p.Id, ids);
        return await _productsCollection.Find(filter).ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _productsCollection.ReplaceOneAsync(p => p.Id == product.Id, product, cancellationToken: cancellationToken);
    }

    public async Task<(IEnumerable<Product> Products, int Total)> GetByVendorIdAsync(Guid vendorId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Product>.Filter.Eq(p => p.VendorId, vendorId);

        var total = await _productsCollection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var products = await _productsCollection.Find(filter)
          .SortByDescending(p => p.CreatedAt)
          .Skip((page - 1) * pageSize)
          .Limit(pageSize)
          .ToListAsync(cancellationToken);

        return (products, (int)total);
    }

    public async Task<IEnumerable<string>> GetIdsByVendorIdAsync(Guid vendorId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Product>.Filter.Eq(p => p.VendorId, vendorId);
        var projection = Builders<Product>.Projection.Include(p => p.Id);

        var cursor = await _productsCollection.Find(filter).Project(projection).ToCursorAsync(cancellationToken);

        return cursor.ToEnumerable().Select(doc => doc["_id"].AsObjectId.ToString());
    }

    public async Task<bool> HasProductsAsync(CancellationToken cancellationToken = default)
    {
        // This is the new method needed for seeding
        return await _productsCollection.CountDocumentsAsync(FilterDefinition<Product>.Empty, cancellationToken: cancellationToken) > 0;
    }

    public async Task AddCategoryAsync(Category category, CancellationToken cancellationToken = default)
    {
        await _categoriesCollection.InsertOneAsync(category, null, cancellationToken);
    }

    public async Task<IEnumerable<Category>> GetAllCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _categoriesCollection.Find(_ => true).ToListAsync(cancellationToken);
    }

    public async Task<bool> HasCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _categoriesCollection.CountDocumentsAsync(FilterDefinition<Category>.Empty, cancellationToken: cancellationToken) > 0;
    }

    public async Task<Category?> GetCategoryByIdAsync(ObjectId id, CancellationToken cancellationToken = default)
    {
        return await _categoriesCollection.Find(c => c.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task UpdateCategoryAsync(Category category, CancellationToken cancellationToken = default)
    {
        await _categoriesCollection.ReplaceOneAsync(c => c.Id == category.Id, category, cancellationToken: cancellationToken);
    }

    public async Task DeleteCategoryAsync(ObjectId id, CancellationToken cancellationToken = default)
    {
        await _categoriesCollection.DeleteOneAsync(c => c.Id == id, cancellationToken);
    }
}

public class MongoDbSettings
{
    public string ConnectionString { get; set; }
    public string DatabaseName { get; set; }
}
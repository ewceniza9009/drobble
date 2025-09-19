// src/services/ProductCatalog/Drobble.ProductCatalog.Infrastructure/Persistence/ProductRepository.cs
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

    public ProductRepository(IOptions<MongoDbSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
        _productsCollection = mongoDatabase.GetCollection<Product>(nameof(Product).ToLower() + "s");
    }

    public async Task<Product?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default)
    {
        return await _productsCollection.Find(p => p.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _productsCollection.InsertOneAsync(product, null, cancellationToken);
    }
}

// Helper class to bind appsettings.json to a C# object
public class MongoDbSettings
{
    public string ConnectionString { get; set; }
    public string DatabaseName { get; set; }
}
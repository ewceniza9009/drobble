using Drobble.ShoppingCart.Application.Contracts;
using Drobble.ShoppingCart.Domain.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ShoppingCart.Infrastructure.Persistence;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
}

public class CartRepository : ICartRepository
{
    private readonly IMongoCollection<Cart> _cartsCollection;

    public CartRepository(IOptions<MongoDbSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
        _cartsCollection = mongoDatabase.GetCollection<Cart>(nameof(Cart).ToLower() + "s");
    }

    public async Task<Cart> CreateAsync(Cart cart, CancellationToken cancellationToken = default)
    {
        await _cartsCollection.InsertOneAsync(cart, null, cancellationToken);
        return cart;
    }

    public async Task<Cart?> GetBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default)
    {
        return await _cartsCollection.Find(c => c.SessionId == sessionId).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Cart?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _cartsCollection.Find(c => c.UserId == userId).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task UpdateAsync(Cart cart, CancellationToken cancellationToken = default)
    {
        await _cartsCollection.ReplaceOneAsync(c => c.Id == cart.Id, cart, cancellationToken: cancellationToken);
    }

    public async Task DeleteAsync(ObjectId cartId, CancellationToken cancellationToken = default)
    {
        await _cartsCollection.DeleteOneAsync(c => c.Id == cartId, cancellationToken);
    }
}
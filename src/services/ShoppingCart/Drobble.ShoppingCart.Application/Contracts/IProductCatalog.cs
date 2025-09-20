using MongoDB.Bson;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.ShoppingCart.Application.Contracts
{
    public record ProductDto(string Id, string Name, decimal Price);

    public interface IProductCatalogService
    {
        Task<ProductDto?> GetProductByIdAsync(ObjectId productId, CancellationToken cancellationToken = default);
    }
}
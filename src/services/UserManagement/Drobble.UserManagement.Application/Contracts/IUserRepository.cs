using Drobble.UserManagement.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.UserManagement.Application.Contracts;

public interface IUserRepository
{
    Task<bool> IsUsernameTakenAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> IsEmailTakenAsync(string email, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);  
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);  
    Task<IEnumerable<User>> GetAllAsync(int page, int pageSize, string? search, UserRole? role, bool? isActive, CancellationToken cancellationToken = default);  
}
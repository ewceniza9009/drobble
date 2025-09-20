using Drobble.UserManagement.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.UserManagement.Application.Contracts;

public interface IUserRepository
{
    Task<bool> IsUsernameTakenAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> IsEmailTakenAsync(string email, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default); // Add this line
}
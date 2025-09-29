using Drobble.UserManagement.Application.Contracts;

namespace Drobble.UserManagement.Infrastructure.Security;

public class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}
using Drobble.UserManagement.Application.Contracts;

namespace Drobble.UserManagement.Infrastructure.Security;

public class BCryptPasswordVerifier : IPasswordVerifier
{
    public bool Verify(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}
// src/services/UserManagement/Drobble.UserManagement.Infrastructure/Security/BCryptPasswordHasher.cs
using Drobble.UserManagement.Application.Contracts;

namespace Drobble.UserManagement.Infrastructure.Security;

public class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        // BCrypt.Net handles generating a salt and hashing
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}
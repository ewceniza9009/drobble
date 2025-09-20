using Drobble.UserManagement.Domain.Entities;

namespace Drobble.UserManagement.Application.Contracts;

public interface IJwtGenerator
{
    string GenerateToken(User user);
}
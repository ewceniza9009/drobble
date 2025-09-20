// src/services/UserManagement/Drobble.UserManagement.Application/Contracts/IPasswordHasher.cs
namespace Drobble.UserManagement.Application.Contracts;

public interface IPasswordHasher
{
    string Hash(string password);
}
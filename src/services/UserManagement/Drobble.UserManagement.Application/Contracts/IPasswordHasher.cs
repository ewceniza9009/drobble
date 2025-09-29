namespace Drobble.UserManagement.Application.Contracts;

public interface IPasswordHasher
{
    string Hash(string password);
}
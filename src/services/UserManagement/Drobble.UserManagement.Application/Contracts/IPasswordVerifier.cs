namespace Drobble.UserManagement.Application.Contracts;

public interface IPasswordVerifier
{
    bool Verify(string password, string hashedPassword);
}
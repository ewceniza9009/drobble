using Drobble.UserManagement.Application.Contracts;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.UserManagement.Application.Features.Users.Queries;

public class LoginUserQueryHandler : IRequestHandler<LoginUserQuery, string>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordVerifier _passwordVerifier;
    private readonly IJwtGenerator _jwtGenerator;

    public LoginUserQueryHandler(IUserRepository userRepository, IPasswordVerifier passwordVerifier, IJwtGenerator jwtGenerator)
    {
        _userRepository = userRepository;
        _passwordVerifier = passwordVerifier;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<string> Handle(LoginUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByUsernameAsync(request.Username, cancellationToken);
        if (user is null)
        {
            throw new Exception("Invalid username or password."); // Use generic error
        }

        var isPasswordValid = _passwordVerifier.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new Exception("Invalid username or password.");
        }

        if (!user.IsActive)
        {
            throw new Exception("This account has been disabled.");
        }

        return _jwtGenerator.GenerateToken(user);
    }
}
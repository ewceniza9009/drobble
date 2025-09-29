using Drobble.UserManagement.Application.Contracts;
using Drobble.UserManagement.Domain.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Drobble.UserManagement.Application.Features.Users.Commands;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        if (await _userRepository.IsUsernameTakenAsync(request.Username, cancellationToken))
        {
            throw new Exception("Username is already taken.");       
        }

        if (await _userRepository.IsEmailTakenAsync(request.Email, cancellationToken))
        {
            throw new Exception("Email is already taken.");
        }

        var hashedPassword = _passwordHasher.Hash(request.Password);

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = hashedPassword
        };

        await _userRepository.AddAsync(user, cancellationToken);

        return user.Id;
    }
}
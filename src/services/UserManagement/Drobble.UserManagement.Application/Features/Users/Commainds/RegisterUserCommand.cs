using MediatR;
using System;

namespace Drobble.UserManagement.Application.Features.Users.Commands
{
    public record RegisterUserCommand(
        string Username,
        string Email,
        string Password) : IRequest<Guid>; // Returns the new User's ID
}
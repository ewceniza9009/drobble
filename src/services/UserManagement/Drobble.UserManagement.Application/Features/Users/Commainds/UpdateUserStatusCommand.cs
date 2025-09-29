using MediatR;
using System;
using Drobble.UserManagement.Application.Contracts;
using Drobble.UserManagement.Domain.Entities;

namespace Drobble.UserManagement.Application.Features.Users.Commands;

public record UpdateUserStatusCommand(Guid UserId, bool IsActive, UserRole Role) : IRequest;

public class UpdateUserStatusCommandHandler : IRequestHandler<UpdateUserStatusCommand>
{
    private readonly IUserRepository _userRepository;

    public UpdateUserStatusCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task Handle(UpdateUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            throw new Exception("User not found.");    
        }

        user.IsActive = request.IsActive;
        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);
    }
}
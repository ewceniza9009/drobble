using Drobble.UserManagement.Application.Contracts;
using Drobble.UserManagement.Domain.Entities;
using MediatR;
using System.Linq;

namespace Drobble.UserManagement.Application.Features.Users.Queries;

public record UserDto(Guid Id, string Username, string Email, UserRole Role, bool IsActive, DateTime CreatedAt);

public record GetUsersQuery(int Page, int PageSize, string? Search, UserRole? Role, bool? IsActive) : IRequest<IEnumerable<UserDto>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, IEnumerable<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(request.Page, request.PageSize, request.Search, request.Role, request.IsActive, cancellationToken);
        return users.Select(u => new UserDto(u.Id, u.Username, u.Email, u.Role, u.IsActive, u.CreatedAt));
    }
}
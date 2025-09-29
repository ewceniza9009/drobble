using Drobble.UserManagement.Application.Contracts;
using MediatR;

namespace Drobble.UserManagement.Application.Features.Users.Queries;

public record UserData(Guid Id, string Username);

public record GetUsersByIdsQuery(IEnumerable<Guid> UserIds) : IRequest<IEnumerable<UserData>>;

public class GetUsersByIdsQueryHandler : IRequestHandler<GetUsersByIdsQuery, IEnumerable<UserData>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersByIdsQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserData>> Handle(GetUsersByIdsQuery request, CancellationToken cancellationToken)
    {
        var users = new List<UserData>();
        foreach (var userId in request.UserIds.Distinct())
        {
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user != null)
            {
                users.Add(new UserData(user.Id, user.Username));
            }
        }
        return users;
    }
}
using MediatR;

namespace Drobble.UserManagement.Application.Features.Users.Queries;

public record LoginUserQuery(string Username, string Password) : IRequest<string>;    
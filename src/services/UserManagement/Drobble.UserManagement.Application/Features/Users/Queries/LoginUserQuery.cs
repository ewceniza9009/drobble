using MediatR;

namespace Drobble.UserManagement.Application.Features.Users.Queries;

// A Query is appropriate here as it reads data and returns a result without changing state.
public record LoginUserQuery(string Username, string Password) : IRequest<string>; // Returns the JWT
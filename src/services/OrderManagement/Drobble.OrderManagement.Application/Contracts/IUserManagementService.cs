namespace Drobble.OrderManagement.Application.Contracts;

public record UserData(Guid Id, string Username);

public interface IUserManagementService
{
    Task<IEnumerable<UserData>> GetUsersByIdsAsync(IEnumerable<Guid> userIds, CancellationToken cancellationToken = default);
}
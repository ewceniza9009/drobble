using Drobble.UserManagement.Application.Contracts;
using Drobble.UserManagement.Domain.Entities;
using Drobble.UserManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class UserRepository : IUserRepository
{
    private readonly UserDbContext _context;

    public UserRepository(UserDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<bool> IsEmailTakenAsync(string email, CancellationToken cancellationToken = default)
      => _context.Users.AnyAsync(u => u.Email == email, cancellationToken);

    public Task<bool> IsUsernameTakenAsync(string username, CancellationToken cancellationToken = default)
      => _context.Users.AnyAsync(u => u.Username == username, cancellationToken);

    public Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
      => _context.Users.FirstOrDefaultAsync(u => u.Username == username, cancellationToken);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _context.Users.FindAsync(new object[] { id }, cancellationToken).AsTask();

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> GetAllAsync(int page, int pageSize, string? search, UserRole? role, bool? isActive, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => u.Username.Contains(search) || u.Email.Contains(search));
        }
        if (role.HasValue)
        {
            query = query.Where(u => u.Role == role.Value);
        }
        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }
}
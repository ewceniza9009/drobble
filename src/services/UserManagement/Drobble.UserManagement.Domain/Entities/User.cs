using Drobble.Shared.Kernel;
using System;

namespace Drobble.UserManagement.Domain.Entities;

public class User : Entity<Guid>
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime? LastLogin { get; set; }
    public bool IsMfaEnabled { get; set; }
    public bool IsActive { get; set; } = true;      
}

public enum UserRole
{
    User,
    Vendor,
    Admin
}
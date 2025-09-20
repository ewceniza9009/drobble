using Drobble.Shared.Kernel;
using System;

namespace Drobble.UserManagement.Domain.Entities;

public class Profile : Entity<Guid>
{
    public Guid UserId { get; set; }
    public string? FullName { get; set; }
    public string? Address { get; set; } // Will be mapped to JSONB in the DB
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
}
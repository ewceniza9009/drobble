// ---- File: src/building-blocks/Drobble.Shared.Kernel/Entity.cs ----
using System;

namespace Drobble.Shared.Kernel;

public abstract class Entity<TId>
{
    public virtual TId Id { get; protected set; }
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; protected set; } = DateTime.UtcNow;
}
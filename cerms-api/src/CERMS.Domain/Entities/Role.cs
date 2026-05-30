using CERMS.Domain.Common;
using System;
using System.Collections.Generic;

namespace CERMS.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsSystemRole { get; private set; }
    public bool IsActive { get; private set; }

    public ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();

    protected Role() { }

    public Role(string name, string? description = null, bool isSystemRole = false)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Role name is required.", nameof(name));
        Name = name;
        Description = description;
        IsSystemRole = isSystemRole;
        IsActive = true;
    }

    public void UpdateDetails(string name, string? description, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Role name is required.", nameof(name));
        if (IsSystemRole && !isActive)
            throw new InvalidOperationException("System roles cannot be deactivated.");

        Name = name;
        Description = description;
        IsActive = isActive;
        Update();
    }
}

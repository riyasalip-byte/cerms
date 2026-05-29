using CERMS.Domain.Common;
using System;

namespace CERMS.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsSystemRole { get; private set; }

    protected Role() { }

    public Role(string name, string? description = null, bool isSystemRole = false)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Role name is required.", nameof(name));
        Name = name;
        Description = description;
        IsSystemRole = isSystemRole;
    }

    public void UpdateDetails(string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Role name is required.", nameof(name));
        Name = name;
        Description = description;
        Update();
    }
}

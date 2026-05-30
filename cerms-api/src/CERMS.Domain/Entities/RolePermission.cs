using CERMS.Domain.Common;
using System;

namespace CERMS.Domain.Entities;

public class RolePermission : BaseEntity
{
    public Guid RoleId { get; private set; }
    public Role Role { get; private set; }
    
    public Guid PermissionId { get; private set; }
    public Permission Permission { get; private set; }

    protected RolePermission() { }

    public RolePermission(Guid roleId, Guid permissionId)
    {
        if (roleId == Guid.Empty) throw new ArgumentException("RoleId is required.", nameof(roleId));
        if (permissionId == Guid.Empty) throw new ArgumentException("PermissionId is required.", nameof(permissionId));

        RoleId = roleId;
        PermissionId = permissionId;
    }
}

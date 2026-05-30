using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class Permission : BaseEntity
{
    public string Module { get; private set; }
    public string PermissionCode { get; private set; }
    public string PermissionName { get; private set; }
    public string? Description { get; private set; }
    public bool IsSystemPermission { get; private set; }

    protected Permission() { }

    public Permission(string module, string permissionCode, string permissionName, string? description = null, bool isSystemPermission = true)
    {
        if (string.IsNullOrWhiteSpace(module)) throw new ArgumentException("Module is required.", nameof(module));
        if (string.IsNullOrWhiteSpace(permissionCode)) throw new ArgumentException("PermissionCode is required.", nameof(permissionCode));
        if (string.IsNullOrWhiteSpace(permissionName)) throw new ArgumentException("PermissionName is required.", nameof(permissionName));

        Module = module;
        PermissionCode = permissionCode;
        PermissionName = permissionName;
        Description = description;
        IsSystemPermission = isSystemPermission;
    }
}

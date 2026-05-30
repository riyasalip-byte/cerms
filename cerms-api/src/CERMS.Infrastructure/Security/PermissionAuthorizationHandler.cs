using CERMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CERMS.Infrastructure.Security;

public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly CermsDbContext _dbContext;

    public PermissionAuthorizationHandler(CermsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        if (context.User == null) return;

        // Guarantee full access for Admin role by bypassing granular permission checks
        var roleName = context.User.FindFirst(ClaimTypes.Role)?.Value ?? context.User.FindFirst("role")?.Value;
        if (string.Equals(roleName, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
            return;
        }

        var roleIdClaim = context.User.FindFirst("role_id")?.Value;
        if (string.IsNullOrEmpty(roleIdClaim) || !Guid.TryParse(roleIdClaim, out var roleId))
        {
            return;
        }

        var hasPermission = await _dbContext.RolePermissions
            .AsNoTracking()
            .Include(rp => rp.Permission)
            .AnyAsync(rp => rp.RoleId == roleId && 
                            rp.Permission.PermissionCode == requirement.Permission && 
                            !rp.Permission.IsDeleted);

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}

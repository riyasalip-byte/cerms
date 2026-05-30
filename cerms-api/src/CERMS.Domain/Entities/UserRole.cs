using CERMS.Domain.Common;
using System;

namespace CERMS.Domain.Entities;

public class UserRole : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; }
    
    public Guid RoleId { get; private set; }
    public Role Role { get; private set; }

    protected UserRole() { }

    public UserRole(Guid userId, Guid roleId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId is required.", nameof(userId));
        if (roleId == Guid.Empty) throw new ArgumentException("RoleId is required.", nameof(roleId));

        UserId = userId;
        RoleId = roleId;
    }
}

using CERMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CERMS.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    
    public Guid StaffId { get; private set; }
    public Staff Staff { get; private set; }

    public ICollection<UserRole> UserRoles { get; private set; } = new List<UserRole>();

    // Computed / Mapped properties for backward compatibility
    public Guid RoleId => UserRoles.FirstOrDefault()?.RoleId ?? Guid.Empty;
    public Role Role => UserRoles.FirstOrDefault()?.Role;

    public bool IsActive { get; private set; }
    public DateTime? LastLoginAt { get; private set; }

    public ICollection<RefreshToken> RefreshTokens { get; private set; } = new List<RefreshToken>();

    protected User() { }

    public User(string username, string email, string passwordHash, Guid staffId, Guid roleId, Guid companyId, Guid branchId)
    {
        if (string.IsNullOrWhiteSpace(username)) throw new ArgumentException("Username is required.", nameof(username));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required.", nameof(email));
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("Password hash is required.", nameof(passwordHash));
        if (staffId == Guid.Empty) throw new ArgumentException("StaffId is required.", nameof(staffId));
        if (roleId == Guid.Empty) throw new ArgumentException("RoleId is required.", nameof(roleId));

        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        StaffId = staffId;
        CompanyId = companyId;
        BranchId = branchId;
        IsActive = true;

        UserRoles.Add(new UserRole(Id, roleId));
    }

    public void UpdateProfile(string username, string email)
    {
        if (string.IsNullOrWhiteSpace(username)) throw new ArgumentException("Username is required.", nameof(username));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required.", nameof(email));
        
        Username = username;
        Email = email;
        Update();
    }

    public void UpdateRole(Guid roleId)
    {
        if (roleId == Guid.Empty) throw new ArgumentException("RoleId is required.", nameof(roleId));
        UserRoles.Clear();
        UserRoles.Add(new UserRole(Id, roleId));
        Update();
    }

    public void SetLastLogin()
    {
        LastLoginAt = DateTime.UtcNow;
        Update();
    }

    public void UpdatePassword(string newHash)
    {
        if (string.IsNullOrWhiteSpace(newHash)) throw new ArgumentException("Password hash is required.", nameof(newHash));
        PasswordHash = newHash;
        Update();
    }

    public void Deactivate()
    {
        IsActive = false;
        Update();
    }

    public void Activate()
    {
        IsActive = true;
        Update();
    }
}

using CERMS.Domain.Common;
using CERMS.Domain.Enums;

namespace CERMS.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public UserRole Role { get; private set; }
    public ICollection<RefreshToken> RefreshTokens { get; private set; } = new List<RefreshToken>();

    public User(string username, string email, string passwordHash, UserRole role, Guid companyId, Guid branchId)
    {
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        CompanyId = companyId;
        BranchId = branchId;
    }

    public void UpdateRole(UserRole role)
    {
        Role = role;
        Update();
    }
}

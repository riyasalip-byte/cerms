using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public string TokenHash { get; private set; }
    public Guid UserId { get; private set; }
    public User User { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => RevokedAt == null && !IsExpired;

    public RefreshToken(string tokenHash, Guid userId, DateTime expiresAt)
    {
        TokenHash = tokenHash;
        UserId = userId;
        ExpiresAt = expiresAt;
    }

    public void Revoke()
    {
        RevokedAt = DateTime.UtcNow;
        Update();
    }
}

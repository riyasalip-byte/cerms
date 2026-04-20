namespace CERMS.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; }
    public Guid CompanyId { get; set; }
    public Guid BranchId { get; set; }
    public DateTime CreatedAt { get; protected set; }
    public DateTime? UpdatedAt { get; protected set; }
    public bool IsDeleted { get; protected set; }

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        IsDeleted = false;
    }

    public void Update()
    {
        UpdatedAt = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        Update();
    }
}

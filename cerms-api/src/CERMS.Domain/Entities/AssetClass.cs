using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class AssetClass : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }

    protected AssetClass() { }

    public AssetClass(string name, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Asset class name is required.", nameof(name));
        Name = name;
        Description = description;
        IsActive = true;
    }

    public void UpdateDetails(string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Asset class name is required.", nameof(name));
        Name = name;
        Description = description;
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

using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class AssetCategory : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsTransportationRequiredByDefault { get; private set; }
    public bool IsActive { get; private set; }
    private readonly List<Asset> _assets = new();
    public IReadOnlyCollection<Asset> Assets => _assets.AsReadOnly();

    protected AssetCategory() { } // EF Core

    public AssetCategory(Guid id, string name, string? description, bool isTransportationRequiredByDefault, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Id = id;
        Name = name;
        Description = description;
        IsTransportationRequiredByDefault = isTransportationRequiredByDefault;
        IsActive = isActive;
    }

    public AssetCategory(string name, string? description, bool isTransportationRequiredByDefault, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name;
        Description = description;
        IsTransportationRequiredByDefault = isTransportationRequiredByDefault;
        IsActive = isActive;
    }

    public void Update(string name, string? description, bool isTransportationRequiredByDefault)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name;
        Description = description;
        IsTransportationRequiredByDefault = isTransportationRequiredByDefault;
        base.Update();
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
        base.Update();
    }
}

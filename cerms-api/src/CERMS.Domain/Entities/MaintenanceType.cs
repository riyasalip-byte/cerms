using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class MaintenanceType : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsPreventiveMaintenance { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<MaintenanceRecord> _maintenanceRecords = new();
    public IReadOnlyCollection<MaintenanceRecord> MaintenanceRecords => _maintenanceRecords.AsReadOnly();

    protected MaintenanceType() { }

    public MaintenanceType(Guid id, string name, string? description, bool isPreventiveMaintenance, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Maintenance type name is required.", nameof(name));

        Id = id;
        Name = name;
        Description = description;
        IsPreventiveMaintenance = isPreventiveMaintenance;
        IsActive = isActive;
    }
}

using CERMS.Domain.Common;
using CERMS.Domain.Enums;

namespace CERMS.Domain.Entities;

public class Asset : BaseEntity
{
    // Core
    public string AssetCode { get; private set; }
    public string Name { get; private set; }
    public string AssetType { get; private set; }
    public AssetStatus Status { get; private set; }
    
    // Operational
    public decimal CurrentOdometer { get; private set; }
    public decimal LastServiceOdometer { get; private set; }
    public DateTime PurchaseDate { get; private set; }
    public bool IsActive { get; private set; }
    public decimal MaintenanceCost { get; private set; }

    // Maintenance
    public DateTime? NextServiceDueDate { get; private set; }
    public decimal ServiceIntervalKm { get; private set; }

    private readonly List<MaintenanceRecord> _maintenanceRecords = new();
    public IReadOnlyCollection<MaintenanceRecord> MaintenanceRecords => _maintenanceRecords.AsReadOnly();

    protected Asset() { } // Parameterless constructor for EF Core

    public Asset(string assetCode, string name, string assetType, decimal currentOdometer, DateTime purchaseDate, decimal serviceIntervalKm)
    {
        if (string.IsNullOrWhiteSpace(assetCode)) throw new ArgumentException("Asset code is required.", nameof(assetCode));
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(assetType)) throw new ArgumentException("Asset type is required.", nameof(assetType));
        
        AssetCode = assetCode;
        Name = name;
        AssetType = assetType;
        CurrentOdometer = currentOdometer;
        PurchaseDate = purchaseDate;
        ServiceIntervalKm = serviceIntervalKm;
        
        LastServiceOdometer = currentOdometer;
        MaintenanceCost = 0;
        Status = AssetStatus.Available;
        IsActive = true;
    }

    public void UpdateDetails(string name, string assetType)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(assetType)) throw new ArgumentException("Asset type is required.", nameof(assetType));

        Name = name;
        AssetType = assetType;
        Update();
    }

    public void UpdateStatus(AssetStatus newStatus)
    {
        if (Status == newStatus) return;

        // Prevent invalid transitions
        if (Status == AssetStatus.Decommissioned && newStatus != AssetStatus.Available)
            throw new InvalidOperationException("Decommissioned assets can only be made Available.");
            
        if (Status == AssetStatus.Rented && newStatus == AssetStatus.Maintenance)
            throw new InvalidOperationException("Cannot send a rented asset directly to maintenance.");

        Status = newStatus;
        Update();
    }

    public void UpdateOdometer(decimal odometer)
    {
        if (odometer < CurrentOdometer)
            throw new ArgumentException("New odometer reading cannot be less than current reading.", nameof(odometer));
            
        CurrentOdometer = odometer;
        Update();
    }

    // Lifecycle methods
    public void Rent()
    {
        if (Status != AssetStatus.Available)
            throw new InvalidOperationException($"Cannot rent asset in status: {Status}");

        Status = AssetStatus.Rented;
        Update();
    }

    public void ReturnFromRent(decimal returnOdometer)
    {
        if (Status != AssetStatus.Rented)
            throw new InvalidOperationException($"Cannot return asset that is not rented (Current status: {Status})");

        UpdateOdometer(returnOdometer);
        Status = AssetStatus.Available;
        Update();
    }

    public void SendToMaintenance()
    {
        if (Status == AssetStatus.Decommissioned)
            throw new InvalidOperationException("Cannot send decommissioned asset to maintenance.");

        Status = AssetStatus.Maintenance;
        Update();
    }

    public void CompleteMaintenance(decimal additionalCost = 0, decimal? serviceOdometer = null, DateTime? nextServiceDueDate = null)
    {
        if (Status != AssetStatus.Maintenance)
            throw new InvalidOperationException($"Cannot complete maintenance for asset in status: {Status}. Must be in Maintenance.");

        MaintenanceCost += additionalCost;
        
        if (serviceOdometer.HasValue)
        {
            LastServiceOdometer = serviceOdometer.Value;
            CurrentOdometer = serviceOdometer.Value;
        }

        if (nextServiceDueDate.HasValue)
        {
            NextServiceDueDate = nextServiceDueDate;
        }

        Status = AssetStatus.Available;
        Update();
    }

    public void RecordService(decimal serviceOdometer, decimal cost, DateTime? nextServiceDueDate = null)
    {
        if (serviceOdometer < CurrentOdometer)
            throw new ArgumentException("Service odometer cannot be less than current odometer.", nameof(serviceOdometer));

        LastServiceOdometer = serviceOdometer;
        CurrentOdometer = serviceOdometer;
        MaintenanceCost += cost;
        
        if (nextServiceDueDate.HasValue)
        {
            NextServiceDueDate = nextServiceDueDate;
        }

        Status = AssetStatus.Available;
        Update();
    }

    public void Decommission()
    {
        IsActive = false;
        Status = AssetStatus.Decommissioned;
        Update();
    }

    public void Activate()
    {
        IsActive = true;
        Status = AssetStatus.Available;
        Update();
    }
}

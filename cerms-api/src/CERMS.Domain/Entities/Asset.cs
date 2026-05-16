using CERMS.Domain.Common;
using CERMS.Domain.Enums;

namespace CERMS.Domain.Entities;

public class Asset : BaseEntity
{
    // Core
    public string AssetCode { get; private set; }
    public string AssetName { get; private set; }
    public AssetCategory AssetCategory { get; private set; }
    public DateTime? PurchaseDate { get; private set; }
    
    // Operational
    public decimal CurrentMeterReading { get; private set; }
    public decimal LastServiceOdometer { get; private set; }

    // Vehicle
    public int? MakeYear { get; private set; }
    public string? Model { get; private set; }
    public string? EngineNo { get; private set; }
    public string? ChasisNo { get; private set; }
    public string? PlaceOfRegistration { get; private set; }
    public string RegisterNo { get; private set; }
    public DateTime? RegisterDate { get; private set; }

    // Compliance
    public DateTime FitnessExpiryDate { get; private set; }
    public string? InsuranceCompany { get; private set; }
    public string? InsuranceNo { get; private set; }
    public DateTime InsuranceExpiryDate { get; private set; }
    public DateTime PuccExpiryDate { get; private set; }

    // Lifecycle
    public AssetStatus Status { get; private set; }
    public bool IsActive { get; private set; }

    // Maintenance
    public decimal MaintenanceCost { get; private set; }
    public DateTime? NextServiceDueDate { get; private set; }
    public decimal? NextServiceOdometer { get; private set; }
    public decimal ServiceIntervalKm { get; private set; }

    // Transportation
    public bool IsTransportationRequired { get; private set; }
    public string? TransportationNotes { get; private set; }

    private readonly List<MaintenanceRecord> _maintenanceRecords = new();
    public IReadOnlyCollection<MaintenanceRecord> MaintenanceRecords => _maintenanceRecords.AsReadOnly();

    protected Asset() { } // Parameterless constructor for EF Core

    public Asset(
        string assetCode,
        string assetName,
        AssetCategory assetCategory,
        decimal currentMeterReading,
        string registerNo,
        DateTime fitnessExpiryDate,
        DateTime insuranceExpiryDate,
        DateTime puccExpiryDate,
        DateTime? purchaseDate = null,
        int? makeYear = null,
        string? model = null,
        string? engineNo = null,
        string? chasisNo = null,
        string? placeOfRegistration = null,
        DateTime? registerDate = null,
        string? insuranceCompany = null,
        string? insuranceNo = null,
        decimal serviceIntervalKm = 10000,
        bool isTransportationRequired = false,
        string? transportationNotes = null)
    {
        if (string.IsNullOrWhiteSpace(assetCode)) throw new ArgumentException("Asset code is required.", nameof(assetCode));
        if (string.IsNullOrWhiteSpace(assetName)) throw new ArgumentException("Asset name is required.", nameof(assetName));
        if (currentMeterReading < 0) throw new ArgumentException("Current meter reading cannot be negative.", nameof(currentMeterReading));
        if (string.IsNullOrWhiteSpace(registerNo)) throw new ArgumentException("Register number is required.", nameof(registerNo));
        if (serviceIntervalKm <= 0) throw new ArgumentException("Service interval must be greater than zero.", nameof(serviceIntervalKm));
        
        AssetCode = assetCode;
        AssetName = assetName;
        AssetCategory = assetCategory;
        CurrentMeterReading = currentMeterReading;
        RegisterNo = registerNo;
        FitnessExpiryDate = fitnessExpiryDate;
        InsuranceExpiryDate = insuranceExpiryDate;
        PuccExpiryDate = puccExpiryDate;
        PurchaseDate = purchaseDate;
        MakeYear = makeYear;
        Model = model;
        EngineNo = engineNo;
        ChasisNo = chasisNo;
        PlaceOfRegistration = placeOfRegistration;
        RegisterDate = registerDate;
        InsuranceCompany = insuranceCompany;
        InsuranceNo = insuranceNo;
        ServiceIntervalKm = serviceIntervalKm;
        IsTransportationRequired = isTransportationRequired;
        TransportationNotes = transportationNotes;
        
        LastServiceOdometer = currentMeterReading;
        MaintenanceCost = 0;
        Status = AssetStatus.Available;
        IsActive = true;
    }

    public void UpdateDetails(
        string assetName,
        AssetCategory assetCategory,
        DateTime? purchaseDate,
        int? makeYear,
        string? model,
        string? engineNo,
        string? chasisNo,
        string? placeOfRegistration,
        string registerNo,
        DateTime? registerDate,
        DateTime fitnessExpiryDate,
        string? insuranceCompany,
        string? insuranceNo,
        DateTime insuranceExpiryDate,
        DateTime puccExpiryDate,
        bool isTransportationRequired,
        string? transportationNotes)
    {
        if (string.IsNullOrWhiteSpace(assetName)) throw new ArgumentException("Asset name is required.", nameof(assetName));
        if (string.IsNullOrWhiteSpace(registerNo)) throw new ArgumentException("Register number is required.", nameof(registerNo));

        AssetName = assetName;
        AssetCategory = assetCategory;
        PurchaseDate = purchaseDate;
        MakeYear = makeYear;
        Model = model;
        EngineNo = engineNo;
        ChasisNo = chasisNo;
        PlaceOfRegistration = placeOfRegistration;
        RegisterNo = registerNo;
        RegisterDate = registerDate;
        FitnessExpiryDate = fitnessExpiryDate;
        InsuranceCompany = insuranceCompany;
        InsuranceNo = insuranceNo;
        InsuranceExpiryDate = insuranceExpiryDate;
        PuccExpiryDate = puccExpiryDate;
        IsTransportationRequired = isTransportationRequired;
        TransportationNotes = transportationNotes;
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

    public void UpdateMeterReading(decimal meterReading)
    {
        if (meterReading < CurrentMeterReading)
            throw new ArgumentException("New meter reading cannot be less than current reading.", nameof(meterReading));
            
        CurrentMeterReading = meterReading;
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

        UpdateMeterReading(returnOdometer);
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

    public void CompleteMaintenance(decimal additionalCost = 0, decimal? serviceOdometer = null, DateTime? nextServiceDueDate = null, decimal? nextServiceOdometer = null)
    {
        if (Status != AssetStatus.Maintenance)
            throw new InvalidOperationException($"Cannot complete maintenance for asset in status: {Status}. Must be in Maintenance.");

        MaintenanceCost += additionalCost;
        
        if (serviceOdometer.HasValue)
        {
            LastServiceOdometer = serviceOdometer.Value;
            CurrentMeterReading = serviceOdometer.Value;
        }

        if (nextServiceDueDate.HasValue)
        {
            NextServiceDueDate = nextServiceDueDate;
        }

        if (nextServiceOdometer.HasValue)
        {
            NextServiceOdometer = nextServiceOdometer;
        }

        Status = AssetStatus.Available;
        Update();
    }

    public void RecordService(decimal serviceOdometer, decimal cost, DateTime? nextServiceDueDate = null, decimal? nextServiceOdometer = null)
    {
        if (serviceOdometer < CurrentMeterReading)
            throw new ArgumentException("Service meter reading cannot be less than current meter reading.", nameof(serviceOdometer));

        LastServiceOdometer = serviceOdometer;
        CurrentMeterReading = serviceOdometer;
        MaintenanceCost += cost;
        
        if (nextServiceDueDate.HasValue)
        {
            NextServiceDueDate = nextServiceDueDate;
        }

        if (nextServiceOdometer.HasValue)
        {
            NextServiceOdometer = nextServiceOdometer;
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

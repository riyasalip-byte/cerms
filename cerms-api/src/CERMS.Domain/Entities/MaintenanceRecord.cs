using CERMS.Domain.Common;
using CERMS.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace CERMS.Domain.Entities;

public class MaintenanceRecord : BaseEntity
{
    public Guid AssetId { get; private set; }
    public Guid MaintenanceTypeId { get; private set; }
    public string Description { get; private set; }
    public decimal OdoMeterReading { get; private set; }
    public decimal? EstimatedCost { get; private set; }
    public decimal SparePartsCost { get; private set; }
    public decimal LabourCost { get; private set; }
    public decimal TotalCost { get; private set; }
    public string? ServiceVendor { get; private set; }
    public DateTime ServiceDate { get; private set; }
    public DateTime? NextServiceDate { get; private set; }
    public decimal? NextServiceOdoMeterReading { get; private set; }
    public string? ServiceRemarks { get; private set; }
    public MaintenanceStatus Status { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    public Asset Asset { get; private set; }
    public MaintenanceType MaintenanceType { get; private set; }

    protected MaintenanceRecord() { } // EF Core

    public MaintenanceRecord(
        Guid assetId,
        Guid maintenanceTypeId,
        string description,
        decimal odoMeterReading,
        decimal? estimatedCost,
        string? serviceVendor,
        DateTime serviceDate)
    {
        if (assetId == Guid.Empty) throw new ArgumentException("Asset ID is required.", nameof(assetId));
        if (maintenanceTypeId == Guid.Empty) throw new ArgumentException("Maintenance type is required.", nameof(maintenanceTypeId));
        if (string.IsNullOrWhiteSpace(description)) throw new ArgumentException("Description is required.", nameof(description));
        if (odoMeterReading < 0) throw new ArgumentException("Odometer reading cannot be negative.", nameof(odoMeterReading));
        if (estimatedCost.HasValue && estimatedCost < 0) throw new ArgumentException("Estimated cost cannot be negative.", nameof(estimatedCost));

        AssetId = assetId;
        MaintenanceTypeId = maintenanceTypeId;
        Description = description;
        OdoMeterReading = odoMeterReading;
        EstimatedCost = estimatedCost;
        SparePartsCost = 0;
        LabourCost = 0;
        TotalCost = 0;
        ServiceVendor = serviceVendor;
        ServiceDate = serviceDate;
        Status = MaintenanceStatus.Pending;
    }

    public void Complete(decimal sparePartsCost, decimal labourCost, DateTime? completedAt = null, string? serviceRemarks = null, DateTime? nextServiceDate = null, decimal? nextServiceOdoMeterReading = null)
    {
        if (sparePartsCost < 0) throw new ArgumentException("Spare parts cost cannot be negative.", nameof(sparePartsCost));
        if (labourCost < 0) throw new ArgumentException("Labour cost cannot be negative.", nameof(labourCost));

        SparePartsCost = sparePartsCost;
        LabourCost = labourCost;
        TotalCost = sparePartsCost + labourCost;

        if (!string.IsNullOrWhiteSpace(serviceRemarks))
        {
            ServiceRemarks = serviceRemarks;
        }

        Status = MaintenanceStatus.Completed;
        CompletedAt = completedAt ?? DateTime.UtcNow;
        NextServiceDate = nextServiceDate;
        NextServiceOdoMeterReading = nextServiceOdoMeterReading;
        Update();
    }

    [NotMapped]
    public decimal Cost => TotalCost;

    [NotMapped]
    public decimal? FinalCost => Status == MaintenanceStatus.Completed ? TotalCost : null;

    [NotMapped]
    public decimal Odometer => OdoMeterReading;

    [NotMapped]
    public DateTime? NextServiceDueDate => NextServiceDate;

    [NotMapped]
    public decimal? NextServiceOdometer => NextServiceOdoMeterReading;
}

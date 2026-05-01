using CERMS.Domain.Common;
using CERMS.Domain.Enums;

namespace CERMS.Domain.Entities;

public class MaintenanceRecord : BaseEntity
{
    public Guid AssetId { get; private set; }
    public string Description { get; private set; }
    public decimal Cost { get; private set; } // Estimated Cost
    public decimal? FinalCost { get; private set; }
    public DateTime ServiceDate { get; private set; }
    public decimal Odometer { get; private set; }
    public DateTime? NextServiceDueDate { get; private set; }
    public MaintenanceStatus Status { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    // Navigation property
    public Asset Asset { get; private set; }

    protected MaintenanceRecord() { } // EF Core

    public MaintenanceRecord(Guid assetId, string description, decimal cost, DateTime serviceDate, decimal odometer, DateTime? nextServiceDueDate = null)
    {
        if (assetId == Guid.Empty) throw new ArgumentException("Asset ID is required.", nameof(assetId));
        if (string.IsNullOrWhiteSpace(description)) throw new ArgumentException("Description is required.", nameof(description));

        AssetId = assetId;
        Description = description;
        Cost = cost;
        ServiceDate = serviceDate;
        Odometer = odometer;
        NextServiceDueDate = nextServiceDueDate;
        Status = MaintenanceStatus.Pending;
    }

    public void UpdateDetails(decimal finalCost, string? notes, DateTime? serviceDate)
    {
        FinalCost = finalCost;
        if (!string.IsNullOrWhiteSpace(notes))
        {
            Description = $"{Description} | Notes: {notes}";
        }
        if (serviceDate.HasValue)
        {
            ServiceDate = serviceDate.Value;
        }
        Status = MaintenanceStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }
}

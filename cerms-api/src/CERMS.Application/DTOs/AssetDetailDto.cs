using CERMS.Domain.Enums;

namespace CERMS.Application.DTOs;

public class AssetDetailDto
{
    public Guid Id { get; set; }
    public string AssetCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public AssetStatus Status { get; set; }
    public decimal CurrentOdometer { get; set; }
    public decimal LastServiceOdometer { get; set; }
    public DateTime PurchaseDate { get; set; }
    public bool IsActive { get; set; }
    public decimal MaintenanceCost { get; set; }
    public DateTime? NextServiceDueDate { get; set; }
    public decimal ServiceIntervalKm { get; set; }

    public List<MaintenanceRecordDto> MaintenanceRecords { get; set; } = new();
}

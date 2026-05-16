namespace CERMS.Application.DTOs;

public class MaintenanceRecordDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public DateTime ServiceDate { get; set; }
    public decimal Odometer { get; set; }
    public DateTime? NextServiceDueDate { get; set; }
    public decimal? NextServiceOdometer { get; set; }
    public decimal? FinalCost { get; set; }
    public CERMS.Domain.Enums.MaintenanceStatus Status { get; set; }
    public DateTime? CompletedAt { get; set; }
}

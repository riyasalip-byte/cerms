namespace CERMS.Application.DTOs;

public class MaintenanceRecordDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public Guid MaintenanceTypeId { get; set; }
    public string MaintenanceTypeName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal OdoMeterReading { get; set; }
    public decimal? EstimatedCost { get; set; }
    public decimal SparePartsCost { get; set; }
    public decimal LabourCost { get; set; }
    public decimal TotalCost { get; set; }
    public string? ServiceVendor { get; set; }
    public DateTime ServiceDate { get; set; }
    public DateTime? NextServiceDate { get; set; }
    public decimal? NextServiceOdoMeterReading { get; set; }
    public string? ServiceRemarks { get; set; }
    public CERMS.Domain.Enums.MaintenanceStatus Status { get; set; }
    public DateTime? CompletedAt { get; set; }

    public decimal Cost => TotalCost;
    public decimal Odometer => OdoMeterReading;
    public DateTime? NextServiceDueDate => NextServiceDate;
    public decimal? NextServiceOdometer => NextServiceOdoMeterReading;
    public decimal? FinalCost => Status == CERMS.Domain.Enums.MaintenanceStatus.Completed ? TotalCost : null;
}

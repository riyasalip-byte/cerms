namespace CERMS.Application.DTOs;

public class CompleteMaintenanceDto
{
    public Guid MaintenanceId { get; set; }
    public decimal SparePartsCost { get; set; }
    public decimal LabourCost { get; set; }
    public string? Notes { get; set; }
    public DateTime? ServiceDate { get; set; }
    public DateTime? NextServiceDueDate { get; set; }
    public decimal? NextServiceOdometer { get; set; }
}

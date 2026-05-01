namespace CERMS.Application.DTOs;

public class CompleteMaintenanceDto
{
    public Guid MaintenanceId { get; set; }
    public decimal FinalCost { get; set; }
    public string? Notes { get; set; }
    public DateTime? ServiceDate { get; set; }
}

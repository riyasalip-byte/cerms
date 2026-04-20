namespace CERMS.Application.DTOs;

public class BillingResultDto
{
    public double Quantity { get; set; }
    public decimal UnitRate { get; set; }
    public decimal TotalAmount { get; set; }
    public string BreakdownText { get; set; } = string.Empty;
}

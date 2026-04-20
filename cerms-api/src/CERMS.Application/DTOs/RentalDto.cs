using CERMS.Domain.Enums;

namespace CERMS.Application.DTOs;

public class RentalDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime ExpectedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public RentalStatus Status { get; set; }
    public decimal RentalRate { get; set; }
    public RateType RateType { get; set; }
}

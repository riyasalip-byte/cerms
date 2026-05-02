using CERMS.Domain.Enums;

namespace CERMS.Application.DTOs;

public class RentalDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public RentalStatus Status { get; set; }

    public DateTime StartDateTime { get; set; }
    public DateTime ExpectedEndDateTime { get; set; }
    public DateTime? ActualEndDateTime { get; set; }

    public RateType RateType { get; set; }
    public decimal RateAmount { get; set; }

    public decimal? StartOdometer { get; set; }
    public decimal? EndOdometer { get; set; }

    public decimal? TotalAmount { get; set; }
    public bool IsInvoiced { get; set; }
}

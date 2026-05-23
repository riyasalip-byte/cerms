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

    public RateType? RateType { get; set; }
    public decimal? RateAmount { get; set; }

    public decimal? StartOdometer { get; set; }
    public decimal? EndOdometer { get; set; }

    public decimal? TotalAmount { get; set; }
    public bool IsInvoiced { get; set; }

    // Site Details
    public string SiteName { get; set; } = string.Empty;
    public string SiteAddress { get; set; } = string.Empty;
    public string? SiteLandmark { get; set; }
    public string? SiteContactPerson { get; set; }
    public string? SiteContactNumber { get; set; }

    // Transportation
    public decimal? PickupTransportCharge { get; set; }
    public decimal? ReturnTransportCharge { get; set; }
    public string? TransportNotes { get; set; }

    // Financial
    public decimal? AdvanceAmount { get; set; }
    public decimal? SecurityDepositAmount { get; set; }

    // Fuel Responsibility
    public FuelResponsibilityType FuelResponsibilityType { get; set; }
}

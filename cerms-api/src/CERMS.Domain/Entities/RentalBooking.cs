using CERMS.Domain.Common;
using CERMS.Domain.Enums;

namespace CERMS.Domain.Entities;

public class RentalBooking : BaseEntity
{
    public Guid AssetId { get; private set; }
    public Guid CustomerId { get; private set; }
    public RentalStatus Status { get; private set; }

    public DateTime StartDateTime { get; private set; }
    public DateTime ExpectedEndDateTime { get; private set; }
    public DateTime? ActualEndDateTime { get; private set; }

    public RateType? RateType { get; private set; }
    public decimal? RateAmount { get; private set; }

    public decimal? StartOdometer { get; private set; }
    public decimal? EndOdometer { get; private set; }

    public decimal? TotalAmount { get; private set; }
    public bool IsInvoiced { get; private set; }

    // Site Details
    public string SiteName { get; private set; } = string.Empty;
    public string SiteAddress { get; private set; } = string.Empty;
    public string? SiteLandmark { get; private set; }
    public string? SiteContactPerson { get; private set; }
    public string? SiteContactNumber { get; private set; }

    // Transportation
    public decimal? PickupTransportCharge { get; private set; }
    public decimal? ReturnTransportCharge { get; private set; }
    public string? TransportNotes { get; private set; }

    // Financial
    public decimal? AdvanceAmount { get; private set; }
    public decimal? SecurityDepositAmount { get; private set; }

    // Fuel Responsibility
    public FuelResponsibilityType FuelResponsibilityType { get; private set; }

    private RentalBooking() { }

    public RentalBooking(
        Guid assetId, 
        Guid customerId, 
        DateTime startDateTime, 
        DateTime expectedEndDateTime, 
        RateType? rateType = null, 
        decimal? rateAmount = null, 
        decimal? startOdometer = null,
        string siteName = "",
        string siteAddress = "",
        string? siteLandmark = null,
        string? siteContactPerson = null,
        string? siteContactNumber = null,
        decimal? pickupTransportCharge = null,
        decimal? returnTransportCharge = null,
        string? transportNotes = null,
        decimal? advanceAmount = null,
        decimal? securityDepositAmount = null,
        FuelResponsibilityType fuelResponsibilityType = FuelResponsibilityType.Customer)
    {
        if (assetId == Guid.Empty) throw new ArgumentException("AssetId is required", nameof(assetId));
        if (customerId == Guid.Empty) throw new ArgumentException("CustomerId is required", nameof(customerId));

        AssetId = assetId;
        CustomerId = customerId;
        StartDateTime = startDateTime;
        ExpectedEndDateTime = expectedEndDateTime;
        RateType = rateType;
        RateAmount = rateAmount;
        StartOdometer = startOdometer;
        Status = RentalStatus.Draft;
        IsInvoiced = false;

        SiteName = siteName ?? string.Empty;
        SiteAddress = siteAddress ?? string.Empty;
        SiteLandmark = siteLandmark;
        SiteContactPerson = siteContactPerson;
        SiteContactNumber = siteContactNumber;
        PickupTransportCharge = pickupTransportCharge;
        ReturnTransportCharge = returnTransportCharge;
        TransportNotes = transportNotes;
        AdvanceAmount = advanceAmount;
        SecurityDepositAmount = securityDepositAmount;
        FuelResponsibilityType = fuelResponsibilityType;
    }

    public void UpdateDetails(
        DateTime startDateTime,
        DateTime expectedEndDateTime,
        RateType? rateType,
        decimal? rateAmount,
        string siteName,
        string siteAddress,
        string? siteLandmark,
        string? siteContactPerson,
        string? siteContactNumber,
        decimal? pickupTransportCharge,
        decimal? returnTransportCharge,
        string? transportNotes,
        decimal? advanceAmount,
        decimal? securityDepositAmount,
        FuelResponsibilityType fuelResponsibilityType)
    {
        if (Status != RentalStatus.Draft && Status != RentalStatus.Confirmed)
            throw new InvalidOperationException("Can only update details when in Draft or Confirmed status.");

        StartDateTime = startDateTime;
        ExpectedEndDateTime = expectedEndDateTime;
        RateType = rateType;
        RateAmount = rateAmount;
        SiteName = siteName;
        SiteAddress = siteAddress;
        SiteLandmark = siteLandmark;
        SiteContactPerson = siteContactPerson;
        SiteContactNumber = siteContactNumber;
        PickupTransportCharge = pickupTransportCharge;
        ReturnTransportCharge = returnTransportCharge;
        TransportNotes = transportNotes;
        AdvanceAmount = advanceAmount;
        SecurityDepositAmount = securityDepositAmount;
        FuelResponsibilityType = fuelResponsibilityType;
        Update();
    }

    public void Confirm()
    {
        if (Status != RentalStatus.Draft)
            throw new InvalidOperationException("Can only confirm from draft status.");
        Status = RentalStatus.Confirmed;
        Update();
    }

    public void Cancel()
    {
        if (Status != RentalStatus.Draft && Status != RentalStatus.Confirmed)
            throw new InvalidOperationException("Can only cancel from Draft or Confirmed status.");
        Status = RentalStatus.Cancelled;
        Update();
    }

    public void Dispatch()
    {
        if (Status != RentalStatus.Confirmed)
            throw new InvalidOperationException("Can only dispatch from confirmed status.");
        Status = RentalStatus.Dispatched;
        Update();
    }

    public void Activate(decimal? startOdometer)
    {
        if (Status != RentalStatus.Dispatched)
            throw new InvalidOperationException("Can only activate from dispatched status.");
        
        StartOdometer = startOdometer ?? StartOdometer;
        Status = RentalStatus.Active;
        Update();
    }

    public void Complete(DateTime actualEndDateTime, decimal? endOdometer, decimal? totalAmount)
    {
        if (Status != RentalStatus.Active)
            throw new InvalidOperationException("Can only complete from active status.");
        
        ActualEndDateTime = actualEndDateTime;
        EndOdometer = endOdometer;
        TotalAmount = totalAmount;
        Status = RentalStatus.Completed;
        Update();
    }

    public void Close()
    {
        if (Status != RentalStatus.Completed)
            throw new InvalidOperationException("Can only close from completed status.");
        Status = RentalStatus.Closed;
        Update();
    }

    public void Extend(DateTime newExpectedEndDateTime)
    {
        if (newExpectedEndDateTime <= ExpectedEndDateTime)
            throw new ArgumentException("New end date must be after current end date.");
        ExpectedEndDateTime = newExpectedEndDateTime;
        Update();
    }

    public void MarkAsInvoiced()
    {
        IsInvoiced = true;
        Update();
    }
}

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

    private RentalBooking() { }

    public RentalBooking(Guid assetId, Guid customerId, DateTime startDateTime, DateTime expectedEndDateTime, RateType? rateType = null, decimal? rateAmount = null, decimal? startOdometer = null)
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
    }

    public void Confirm()
    {
        if (Status != RentalStatus.Draft)
            throw new InvalidOperationException("Can only confirm from draft status.");
        Status = RentalStatus.Confirmed;
        Update();
    }

    public void Activate(decimal? startOdometer)
    {
        if (Status != RentalStatus.Confirmed)
            throw new InvalidOperationException("Can only activate from confirmed status.");
        
        StartOdometer = startOdometer ?? StartOdometer;
        Status = RentalStatus.Active;
        Update();
    }

    public void Close(DateTime actualEndDateTime, decimal? endOdometer, decimal? totalAmount)
    {
        if (Status != RentalStatus.Active)
            throw new InvalidOperationException("Can only close from active status.");
        
        ActualEndDateTime = actualEndDateTime;
        EndOdometer = endOdometer;
        TotalAmount = totalAmount;
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

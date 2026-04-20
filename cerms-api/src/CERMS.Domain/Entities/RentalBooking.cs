using CERMS.Domain.Common;
using CERMS.Domain.Enums;

namespace CERMS.Domain.Entities;

public class RentalBooking : BaseEntity
{
    public Guid AssetId { get; private set; }
    public Guid CustomerId { get; private set; }
    public DateTime BookingDate { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime ExpectedEndDate { get; private set; }
    public DateTime? ActualEndDate { get; private set; }
    public RateType RateType { get; private set; }
    public decimal RentalRate { get; private set; }
    public RentalStatus Status { get; private set; }

    public RentalBooking(Guid assetId, Guid customerId, DateTime startDate, DateTime expectedEndDate, RateType rateType, decimal rentalRate)
    {
        AssetId = assetId;
        CustomerId = customerId;
        BookingDate = DateTime.UtcNow;
        StartDate = startDate;
        ExpectedEndDate = expectedEndDate;
        RateType = rateType;
        RentalRate = rentalRate;
        Status = RentalStatus.Draft;
    }

    public void Confirm()
    {
        if (Status != RentalStatus.Draft)
            throw new InvalidOperationException("Can only confirm from draft status.");
        Status = RentalStatus.Confirmed;
        Update();
    }

    public void Activate()
    {
        if (Status != RentalStatus.Confirmed)
            throw new InvalidOperationException("Can only activate from confirmed status.");
        Status = RentalStatus.Active;
        Update();
    }

    public void Close(DateTime actualEndDate)
    {
        if (Status != RentalStatus.Active)
            throw new InvalidOperationException("Can only close from active status.");
        ActualEndDate = actualEndDate;
        Status = RentalStatus.Closed;
        Update();
    }

    public void Extend(DateTime newExpectedEndDate)
    {
        if (newExpectedEndDate <= ExpectedEndDate)
            throw new ArgumentException("New end date must be after current end date.");
        ExpectedEndDate = newExpectedEndDate;
        Update();
    }
}

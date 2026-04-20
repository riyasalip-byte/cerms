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

    public RentalBooking(Guid assetId, Guid customerId, DateTime startDate, DateTime expectedEndDate, RateType rateType, decimal rentalRate)
    {
        AssetId = assetId;
        CustomerId = customerId;
        BookingDate = DateTime.UtcNow;
        StartDate = startDate;
        ExpectedEndDate = expectedEndDate;
        RateType = rateType;
        RentalRate = rentalRate;
    }

    public void CompleteRental(DateTime actualEndDate)
    {
        ActualEndDate = actualEndDate;
        Update();
    }
}

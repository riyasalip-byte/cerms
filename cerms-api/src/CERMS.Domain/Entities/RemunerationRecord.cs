using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class RemunerationRecord : BaseEntity
{
    public Guid StaffMemberId { get; private set; }
    public DateTime Period { get; private set; } // Representing the month
    public decimal GrossAmount { get; private set; }
    public decimal AdvancesDeducted { get; private set; }
    public decimal NetAmount { get; private set; }
    public string Status { get; private set; } // Pending, Paid, Cancelled

    public RemunerationRecord(Guid staffMemberId, DateTime period, decimal grossAmount, decimal advancesDeducted)
    {
        StaffMemberId = staffMemberId;
        Period = new DateTime(period.Year, period.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        GrossAmount = grossAmount;
        AdvancesDeducted = advancesDeducted;
        NetAmount = grossAmount - advancesDeducted;
        Status = "Pending";
    }

    public void MarkAsPaid()
    {
        Status = "Paid";
        Update();
    }
}

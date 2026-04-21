using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class SalaryAdvance : BaseEntity
{
    public Guid StaffMemberId { get; private set; }
    public decimal Amount { get; private set; }
    public DateTime Date { get; private set; }
    public bool IsDeducted { get; private set; }
    public Guid? RemunerationRecordId { get; private set; }

    public SalaryAdvance(Guid staffMemberId, decimal amount, DateTime date)
    {
        StaffMemberId = staffMemberId;
        Amount = amount;
        Date = date;
        IsDeducted = false;
    }

    public void MarkAsDeducted(Guid recordId)
    {
        IsDeducted = true;
        RemunerationRecordId = recordId;
        Update();
    }
}

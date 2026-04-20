using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class Invoice : BaseEntity
{
    public Guid BookingId { get; private set; }
    public string InvoiceNumber { get; private set; }
    public decimal Amount { get; private set; }
    public DateTime IssuedDate { get; private set; }
    public bool IsPaid { get; private set; }

    public Invoice(Guid bookingId, string invoiceNumber, decimal amount)
    {
        BookingId = bookingId;
        InvoiceNumber = invoiceNumber;
        Amount = amount;
        IssuedDate = DateTime.UtcNow;
        IsPaid = false;
    }

    public void MarkAsPaid()
    {
        IsPaid = true;
        Update();
    }
}

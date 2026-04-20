using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class Invoice : BaseEntity
{
    public Guid BookingId { get; private set; }
    public string InvoiceNumber { get; private set; }
    public decimal Subtotal { get; private set; }
    public decimal Tax { get; private set; }
    public decimal Total { get; private set; }
    public decimal AmountPaid { get; private set; }
    public decimal BalanceDue => Total - AmountPaid;
    public InvoiceStatus Status { get; private set; }
    public DateTime IssuedDate { get; private set; }
    public ICollection<InvoiceLineItem> LineItems { get; private set; } = new List<InvoiceLineItem>();

    public Invoice(Guid bookingId, string invoiceNumber, decimal subtotal, decimal tax)
    {
        BookingId = bookingId;
        InvoiceNumber = invoiceNumber;
        Subtotal = subtotal;
        Tax = tax;
        Total = subtotal + tax;
        AmountPaid = 0;
        Status = InvoiceStatus.Unpaid;
        IssuedDate = DateTime.UtcNow;
    }

    public void RecordPayment(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Payment amount must be positive.");
        
        AmountPaid += amount;
        
        if (AmountPaid >= Total)
        {
            Status = InvoiceStatus.Paid;
        }
        else
        {
            Status = InvoiceStatus.Partial;
        }
        
        Update();
    }
}

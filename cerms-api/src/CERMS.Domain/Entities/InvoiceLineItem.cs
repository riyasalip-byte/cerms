using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class InvoiceLineItem : BaseEntity
{
    public Guid InvoiceId { get; private set; }
    public string Description { get; private set; }
    public double Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalPrice { get; private set; }

    public InvoiceLineItem(Guid invoiceId, string description, double quantity, decimal unitPrice)
    {
        InvoiceId = invoiceId;
        Description = description;
        Quantity = quantity;
        UnitPrice = unitPrice;
        TotalPrice = (decimal)quantity * unitPrice;
    }
}

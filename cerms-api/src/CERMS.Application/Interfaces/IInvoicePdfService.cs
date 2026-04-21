using CERMS.Domain.Entities;

namespace CERMS.Application.Interfaces;

public interface IInvoicePdfService
{
    byte[] GenerateInvoicePdf(Invoice invoice, Customer customer);
}

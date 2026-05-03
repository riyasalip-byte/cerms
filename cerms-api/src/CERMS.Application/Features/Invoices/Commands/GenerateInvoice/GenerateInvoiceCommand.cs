using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Invoices.Commands.GenerateInvoice;

public record GenerateInvoiceCommand(Guid BookingId) : IRequest<Guid>;

public class GenerateInvoiceCommandHandler : IRequestHandler<GenerateInvoiceCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBillingCalculatorService _billingService;
    private readonly IInvoicePdfService _pdfService;
    private readonly IFileStorageService _fileStorageService;

    public GenerateInvoiceCommandHandler(
        IUnitOfWork unitOfWork, 
        IBillingCalculatorService billingService,
        IInvoicePdfService pdfService,
        IFileStorageService fileStorageService)
    {
        _unitOfWork = unitOfWork;
        _billingService = billingService;
        _pdfService = pdfService;
        _fileStorageService = fileStorageService;
    }

    public async Task<Guid> Handle(GenerateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var booking = await _unitOfWork.Repository<RentalBooking>()
            .Entities
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking == null)
        {
            throw new Exception($"Booking {request.BookingId} not found.");
        }

        var endDate = booking.ActualEndDateTime ?? booking.ExpectedEndDateTime;
        
        var billingResult = booking.RateAmount.HasValue && booking.RateType.HasValue
            ? _billingService.Calculate(
                booking.StartDateTime,
                endDate,
                booking.RateAmount.Value,
                booking.RateType.Value)
            : new BillingResultDto
            {
                TotalAmount = booking.TotalAmount ?? 0,
                Quantity = 0,
                UnitRate = 0,
                IsRateFinalized = false,
                BreakdownText = "Pending Calculation: rate amount is not set; automatic billing was skipped."
            };

        var subtotal = billingResult.TotalAmount;
        var tax = subtotal * 0.10m; // 10% tax
        
        var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        
        var invoice = new Invoice(
            booking.Id,
            invoiceNumber,
            subtotal,
            tax
        );

        invoice.CompanyId = booking.CompanyId;
        invoice.BranchId = booking.BranchId;

        // Create Line Item
        var lineItem = new InvoiceLineItem(
            invoice.Id,
            billingResult.BreakdownText,
            billingResult.Quantity,
            billingResult.UnitRate
        );
        lineItem.CompanyId = booking.CompanyId;
        lineItem.BranchId = booking.BranchId;

        await _unitOfWork.Repository<Invoice>().AddAsync(invoice);
        await _unitOfWork.Repository<InvoiceLineItem>().AddAsync(lineItem);
        
        // Generate and Save PDF
        var customer = await _unitOfWork.Repository<Customer>()
            .Entities
            .FirstOrDefaultAsync(c => c.Id == booking.CustomerId, cancellationToken);
            
        if (customer != null)
        {
            // Add line items to invoice for PDF generation
            invoice.LineItems.Add(lineItem);
            
            var pdfBytes = _pdfService.GenerateInvoicePdf(invoice, customer);
            var fileName = $"{invoice.InvoiceNumber}.pdf";
            var savedPath = await _fileStorageService.SaveFileAsync(pdfBytes, fileName, "application/pdf");
            invoice.SetPdfUrl(savedPath);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return invoice.Id;
    }
}

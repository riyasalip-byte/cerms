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

        var assignment = await _unitOfWork.Repository<RentalAssignment>()
            .Entities
            .FirstOrDefaultAsync(ra => ra.RentalId == booking.Id && ra.ActualStartDateTime != null, cancellationToken);

        var startDate = assignment?.ActualStartDateTime ?? booking.StartDateTime;
        var endDate = assignment?.ActualEndDateTime ?? booking.ActualEndDateTime ?? booking.ExpectedEndDateTime;
        
        var billingResult = booking.RateAmount.HasValue && booking.RateType.HasValue
            ? _billingService.Calculate(
                startDate,
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

        var pickupCharge = booking.PickupTransportCharge ?? 0m;
        var returnCharge = booking.ReturnTransportCharge ?? 0m;
        var subtotal = billingResult.TotalAmount + pickupCharge + returnCharge;
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

        if (!invoice.LineItems.Contains(lineItem))
        {
            invoice.LineItems.Add(lineItem);
        }

        if (pickupCharge > 0)
        {
            var pickupLineItem = new InvoiceLineItem(
                invoice.Id,
                "Transportation: Pickup Logistics Charge",
                1,
                pickupCharge
            );
            pickupLineItem.CompanyId = booking.CompanyId;
            pickupLineItem.BranchId = booking.BranchId;
            await _unitOfWork.Repository<InvoiceLineItem>().AddAsync(pickupLineItem);
            if (!invoice.LineItems.Contains(pickupLineItem))
            {
                invoice.LineItems.Add(pickupLineItem);
            }
        }

        if (returnCharge > 0)
        {
            var returnLineItem = new InvoiceLineItem(
                invoice.Id,
                "Transportation: Return Logistics Charge",
                1,
                returnCharge
            );
            returnLineItem.CompanyId = booking.CompanyId;
            returnLineItem.BranchId = booking.BranchId;
            await _unitOfWork.Repository<InvoiceLineItem>().AddAsync(returnLineItem);
            if (!invoice.LineItems.Contains(returnLineItem))
            {
                invoice.LineItems.Add(returnLineItem);
            }
        }
        
        // Generate and Save PDF
        var customer = await _unitOfWork.Repository<Customer>()
            .Entities
            .FirstOrDefaultAsync(c => c.Id == booking.CustomerId, cancellationToken);
            
        if (customer != null)
        {
            var pdfBytes = _pdfService.GenerateInvoicePdf(invoice, customer);
            var fileName = $"{invoice.InvoiceNumber}.pdf";
            var savedPath = await _fileStorageService.SaveFileAsync(pdfBytes, fileName, "application/pdf");
            invoice.SetPdfUrl(savedPath);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return invoice.Id;
    }
}

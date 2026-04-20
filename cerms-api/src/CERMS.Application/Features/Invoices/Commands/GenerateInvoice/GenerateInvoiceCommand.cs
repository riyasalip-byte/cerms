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

    public GenerateInvoiceCommandHandler(IUnitOfWork unitOfWork, IBillingCalculatorService billingService)
    {
        _unitOfWork = unitOfWork;
        _billingService = billingService;
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

        var endDate = booking.ActualEndDate ?? booking.ExpectedEndDate;
        
        var billingResult = _billingService.Calculate(
            booking.StartDate, 
            endDate, 
            booking.RentalRate, 
            booking.RateType);

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
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return invoice.Id;
    }
}

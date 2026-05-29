using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Assignments.Commands.OperatorGenerateInvoice;

public record OperatorGenerateInvoiceCommand(Guid AssignmentId) : IRequest<Result<Guid>>;

public class OperatorGenerateInvoiceHandler : IRequestHandler<OperatorGenerateInvoiceCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IBillingCalculatorService _billingService;
    private readonly IInvoicePdfService _pdfService;
    private readonly IFileStorageService _fileStorageService;

    public OperatorGenerateInvoiceHandler(
        IUnitOfWork unitOfWork, 
        ICurrentTenantService currentTenantService,
        IBillingCalculatorService billingService,
        IInvoicePdfService pdfService,
        IFileStorageService fileStorageService)
    {
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _billingService = billingService;
        _pdfService = pdfService;
        _fileStorageService = fileStorageService;
    }

    public async Task<Result<Guid>> Handle(OperatorGenerateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _unitOfWork.Repository<RentalAssignment>().Entities
            .Include(ra => ra.Operator)
            .Include(ra => ra.RentalBooking)
            .FirstOrDefaultAsync(ra => ra.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
            return Result<Guid>.Failure("Assignment not found.");

        var currentUserId = _currentTenantService.UserId;
        if (assignment.Operator.UserId != currentUserId)
            return Result<Guid>.Failure("You are not authorized to generate invoice for this assignment.");

        if (assignment.AssignmentStatus != AssignmentStatus.Completed)
            return Result<Guid>.Failure("Can only generate operator invoice after completing the work.");

        var rental = assignment.RentalBooking;
        if (rental == null)
            return Result<Guid>.Failure("Rental booking associated with this assignment was not found.");

        try
        {
            // Transition Assignment
            assignment.MarkInvoiceGenerated();

            // Transition Rental to Closed
            if (rental.Status == RentalStatus.Completed)
            {
                rental.Close();
            }

            _unitOfWork.Repository<RentalAssignment>().Update(assignment);
            _unitOfWork.Repository<RentalBooking>().Update(rental);

            // Generate Invoice record and PDF
            var startDate = assignment.ActualStartDateTime ?? rental.StartDateTime;
            var endDate = assignment.ActualEndDateTime ?? rental.ActualEndDateTime ?? rental.ExpectedEndDateTime;
            
            var billingResult = rental.RateAmount.HasValue && rental.RateType.HasValue
                ? _billingService.Calculate(
                    startDate,
                    endDate,
                    rental.RateAmount.Value,
                    rental.RateType.Value)
                : new BillingResultDto
                {
                    TotalAmount = rental.TotalAmount ?? 0,
                    Quantity = 0,
                    UnitRate = 0,
                    IsRateFinalized = false,
                    BreakdownText = "Pending Calculation: rate amount is not set; automatic billing was skipped."
                };

            var pickupCharge = rental.PickupTransportCharge ?? 0m;
            var returnCharge = rental.ReturnTransportCharge ?? 0m;
            var subtotal = billingResult.TotalAmount + pickupCharge + returnCharge;
            var tax = subtotal * 0.10m; // 10% tax
            
            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
            
            var invoice = new Invoice(
                rental.Id,
                invoiceNumber,
                subtotal,
                tax
            );

            invoice.CompanyId = rental.CompanyId;
            invoice.BranchId = rental.BranchId;

            // Create Line Item
            var lineItem = new InvoiceLineItem(
                invoice.Id,
                billingResult.BreakdownText,
                billingResult.Quantity,
                billingResult.UnitRate
            );
            lineItem.CompanyId = rental.CompanyId;
            lineItem.BranchId = rental.BranchId;

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
                pickupLineItem.CompanyId = rental.CompanyId;
                pickupLineItem.BranchId = rental.BranchId;
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
                returnLineItem.CompanyId = rental.CompanyId;
                returnLineItem.BranchId = rental.BranchId;
                await _unitOfWork.Repository<InvoiceLineItem>().AddAsync(returnLineItem);
                if (!invoice.LineItems.Contains(returnLineItem))
                {
                    invoice.LineItems.Add(returnLineItem);
                }
            }
            
            // Generate and Save PDF Document via QuestPDF
            var customer = await _unitOfWork.Repository<Customer>()
                .Entities
                .FirstOrDefaultAsync(c => c.Id == rental.CustomerId, cancellationToken);
                
            if (customer != null)
            {
                var pdfBytes = _pdfService.GenerateInvoicePdf(invoice, customer);
                var fileName = $"{invoice.InvoiceNumber}.pdf";
                var savedPath = await _fileStorageService.SaveFileAsync(pdfBytes, fileName, "application/pdf");
                invoice.SetPdfUrl(savedPath);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(assignment.Id);
        }
        catch (Exception ex)
        {
            return Result<Guid>.Failure(ex.Message);
        }
    }
}


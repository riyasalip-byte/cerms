using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Rentals.Commands.CloseRental;

public record CloseRentalCommand(Guid Id, DateTime ActualEndDate, decimal? CurrentOdometer = null) : IRequest<Result<Guid>>;

public class CloseRentalHandler : IRequestHandler<CloseRentalCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBillingCalculatorService _billingService;

    public CloseRentalHandler(IUnitOfWork unitOfWork, IBillingCalculatorService billingService)
    {
        _unitOfWork = unitOfWork;
        _billingService = billingService;
    }

    public async Task<Result<Guid>> Handle(CloseRentalCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.Id);
        if (rental == null) return Result<Guid>.Failure("Rental not found.");

        try
        {
            // Close the rental
            rental.Close(request.ActualEndDate);

            // Update asset status to Available and update odometer
            var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(rental.AssetId);
            if (asset != null)
            {
                asset.UpdateStatus(AssetStatus.Available);
                if (request.CurrentOdometer.HasValue)
                {
                    asset.UpdateOdometer(request.CurrentOdometer.Value);
                }
            }

            // Trigger billing calculation
            var billingResult = _billingService.Calculate(
                rental.StartDate, 
                rental.ActualEndDate.Value, 
                rental.RentalRate, 
                rental.RateType);

            var subtotal = billingResult.TotalAmount;
            var tax = subtotal * 0.10m; // 10% tax

            // Create Invoice
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
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(invoice.Id);
        }
        catch (Exception ex)
        {
            return Result<Guid>.Failure(ex.Message);
        }
    }
}

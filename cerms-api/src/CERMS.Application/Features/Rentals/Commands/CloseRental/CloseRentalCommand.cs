using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Rentals.Commands.CloseRental;

public record CloseRentalCommand(Guid RentalId, decimal EndOdometer, DateTime ActualEndDateTime) : IRequest<Result<BillingResultDto>>;

public class CloseRentalHandler : IRequestHandler<CloseRentalCommand, Result<BillingResultDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBillingCalculatorService _billingService;

    public CloseRentalHandler(IUnitOfWork unitOfWork, IBillingCalculatorService billingService)
    {
        _unitOfWork = unitOfWork;
        _billingService = billingService;
    }

    public async Task<Result<BillingResultDto>> Handle(CloseRentalCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.RentalId);
        if (rental == null) return Result<BillingResultDto>.Failure("Rental not found.");

        if (rental.Status != RentalStatus.Active)
            return Result<BillingResultDto>.Failure("Only active rentals can be closed.");

        var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(rental.AssetId);
        if (asset == null) return Result<BillingResultDto>.Failure("Asset not found.");

        if (rental.StartOdometer.HasValue && request.EndOdometer < rental.StartOdometer.Value)
            return Result<BillingResultDto>.Failure("End odometer cannot be less than start odometer.");

        if (request.ActualEndDateTime < rental.StartDateTime)
            return Result<BillingResultDto>.Failure("End date cannot be before start date.");

        // Calculate billing
        var billingResult = _billingService.Calculate(
            rental.StartDateTime, 
            request.ActualEndDateTime, 
            rental.RateAmount, 
            rental.RateType);

        try
        {
            // Close Rental
            rental.Close(request.ActualEndDateTime, request.EndOdometer, billingResult.TotalAmount);

            // Update Asset
            asset.ReturnFromRent(request.EndOdometer);

            _unitOfWork.Repository<RentalBooking>().Update(rental);
            _unitOfWork.Repository<Asset>().Update(asset);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<BillingResultDto>.Success(billingResult);
        }
        catch (InvalidOperationException ex)
        {
            return Result<BillingResultDto>.Failure(ex.Message);
        }
    }
}

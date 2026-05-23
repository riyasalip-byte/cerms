using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using CERMS.Application.Features.Rentals.Commands.CloseRental;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Rentals.Commands.CompleteRental;

public record CompleteRentalCommand(
    Guid RentalId,
    decimal EndOdometer,
    DateTime ActualEndDateTime,
    BillingMode BillingMode = BillingMode.Auto,
    RateType? RateType = null,
    decimal? RateAmount = null,
    decimal? OverrideTotalAmount = null) : IRequest<Result<BillingResultDto>>;

public class CompleteRentalHandler : IRequestHandler<CompleteRentalCommand, Result<BillingResultDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBillingCalculatorService _billingService;

    public CompleteRentalHandler(IUnitOfWork unitOfWork, IBillingCalculatorService billingService)
    {
        _unitOfWork = unitOfWork;
        _billingService = billingService;
    }

    public async Task<Result<BillingResultDto>> Handle(CompleteRentalCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.RentalId);
        if (rental == null) return Result<BillingResultDto>.Failure("Rental not found.");

        if (rental.Status != RentalStatus.Active)
            return Result<BillingResultDto>.Failure("Only active rentals can be completed.");

        var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(rental.AssetId);
        if (asset == null) return Result<BillingResultDto>.Failure("Asset not found.");

        if (rental.StartOdometer.HasValue && request.EndOdometer < rental.StartOdometer.Value)
            return Result<BillingResultDto>.Failure("End odometer cannot be less than start odometer.");

        if (request.ActualEndDateTime < rental.StartDateTime)
            return Result<BillingResultDto>.Failure("End date cannot be before start date.");

        var billingResult = CalculateBilling(request, rental);
        if (!billingResult.IsSuccess)
        {
            return billingResult;
        }

        try
        {
            // Complete Rental
            rental.Complete(request.ActualEndDateTime, request.EndOdometer, billingResult.Value!.TotalAmount);

            // Update Asset
            asset.ReturnFromRent(request.EndOdometer);

            _unitOfWork.Repository<RentalBooking>().Update(rental);
            _unitOfWork.Repository<Asset>().Update(asset);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return billingResult;
        }
        catch (InvalidOperationException ex)
        {
            return Result<BillingResultDto>.Failure(ex.Message);
        }
    }

    private Result<BillingResultDto> CalculateBilling(CompleteRentalCommand request, RentalBooking rental)
    {
        BillingResultDto billingResult;

        switch (request.BillingMode)
        {
            case BillingMode.Auto:
                if (!rental.RateAmount.HasValue || !rental.RateType.HasValue)
                {
                    return Result<BillingResultDto>.Failure(
                        "Automatic billing requires a finalized rental rate. Use ManualRate or OverrideTotal.");
                }

                billingResult = _billingService.Calculate(
                    rental.StartDateTime,
                    request.ActualEndDateTime,
                    rental.RateAmount.Value,
                    rental.RateType.Value);
                billingResult.BreakdownText = $"Auto billing: {billingResult.BreakdownText}";
                break;

            case BillingMode.ManualRate:
                if (!request.RateAmount.HasValue || !request.RateType.HasValue)
                {
                    return Result<BillingResultDto>.Failure("Manual rate and rate cycle are required when using ManualRate billing mode.");
                }

                billingResult = _billingService.Calculate(
                    rental.StartDateTime,
                    request.ActualEndDateTime,
                    request.RateAmount.Value,
                    request.RateType.Value);
                billingResult.BreakdownText = $"Manual rate billing: {billingResult.BreakdownText}";
                break;

            case BillingMode.OverrideTotal:
                if (!request.OverrideTotalAmount.HasValue)
                {
                    return Result<BillingResultDto>.Failure("Override total amount is required when using OverrideTotal billing mode.");
                }

                billingResult = new BillingResultDto
                {
                    TotalAmount = request.OverrideTotalAmount.Value,
                    Quantity = 0,
                    UnitRate = 0,
                    BreakdownText = $"Override total billing: final amount set to {request.OverrideTotalAmount.Value:C}."
                };
                break;

            default:
                return Result<BillingResultDto>.Failure("Invalid billing mode.");
        }

        billingResult.IsRateFinalized = true;
        return Result<BillingResultDto>.Success(billingResult);
    }
}

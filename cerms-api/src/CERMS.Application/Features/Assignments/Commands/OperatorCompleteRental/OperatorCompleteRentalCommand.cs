using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Assignments.Commands.OperatorCompleteRental;

public record OperatorCompleteRentalCommand(
    Guid AssignmentId,
    decimal EndMeterReading,
    string? Remarks,
    DateTime ActualEndDateTime) : IRequest<Result<Guid>>;

public class OperatorCompleteRentalHandler : IRequestHandler<OperatorCompleteRentalCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IBillingCalculatorService _billingService;

    public OperatorCompleteRentalHandler(
        IUnitOfWork unitOfWork,
        ICurrentTenantService currentTenantService,
        IBillingCalculatorService billingService)
    {
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _billingService = billingService;
    }

    public async Task<Result<Guid>> Handle(OperatorCompleteRentalCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _unitOfWork.Repository<RentalAssignment>().Entities
            .Include(ra => ra.Operator)
            .Include(ra => ra.RentalBooking)
            .FirstOrDefaultAsync(ra => ra.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
            return Result<Guid>.Failure("Assignment not found.");

        var currentUserId = _currentTenantService.UserId;
        if (assignment.Operator.UserId != currentUserId)
            return Result<Guid>.Failure("You are not authorized to complete this assignment.");

        if (assignment.AssignmentStatus != AssignmentStatus.Started)
            return Result<Guid>.Failure("Only started assignments can be completed.");

        if (assignment.StartMeterReading.HasValue && request.EndMeterReading < assignment.StartMeterReading.Value)
            return Result<Guid>.Failure("End meter reading cannot be less than start meter reading.");

        if (assignment.ActualStartDateTime.HasValue && request.ActualEndDateTime < assignment.ActualStartDateTime.Value)
            return Result<Guid>.Failure("End date/time cannot be before start date/time.");

        var rental = assignment.RentalBooking;
        if (rental == null)
            return Result<Guid>.Failure("Rental booking associated with this assignment was not found.");

        var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(rental.AssetId);
        if (asset == null)
            return Result<Guid>.Failure("Asset associated with this rental was not found.");

        try
        {
            // Calculate rental total amount
            decimal totalAmount = 0;
            if (rental.RateAmount.HasValue && rental.RateType.HasValue)
            {
                var billingResult = _billingService.Calculate(
                    assignment.ActualStartDateTime ?? rental.StartDateTime,
                    request.ActualEndDateTime,
                    rental.RateAmount.Value,
                    rental.RateType.Value);
                totalAmount = billingResult.TotalAmount;
            }

            // Transition Assignment
            assignment.Complete(request.ActualEndDateTime, request.EndMeterReading, request.Remarks);

            // Transition Rental to Completed
            if (rental.Status == RentalStatus.Active)
            {
                rental.Complete(request.ActualEndDateTime, request.EndMeterReading, totalAmount);
            }

            // Return asset from rent
            if (asset.Status == AssetStatus.Rented)
            {
                asset.ReturnFromRent(request.EndMeterReading);
            }

            _unitOfWork.Repository<RentalAssignment>().Update(assignment);
            _unitOfWork.Repository<RentalBooking>().Update(rental);
            _unitOfWork.Repository<Asset>().Update(asset);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(assignment.Id);
        }
        catch (Exception ex)
        {
            return Result<Guid>.Failure(ex.Message);
        }
    }
}

using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Assignments.Commands.OperatorStartRental;

public record OperatorStartRentalCommand(
    Guid AssignmentId,
    decimal StartMeterReading,
    string? Remarks,
    DateTime ActualStartDateTime) : IRequest<Result<Guid>>;

public class OperatorStartRentalHandler : IRequestHandler<OperatorStartRentalCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;

    public OperatorStartRentalHandler(IUnitOfWork unitOfWork, ICurrentTenantService currentTenantService)
    {
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
    }

    public async Task<Result<Guid>> Handle(OperatorStartRentalCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _unitOfWork.Repository<RentalAssignment>().Entities
            .Include(ra => ra.Operator)
            .Include(ra => ra.RentalBooking)
            .FirstOrDefaultAsync(ra => ra.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
            return Result<Guid>.Failure("Assignment not found.");

        var currentUserId = _currentTenantService.UserId;
        if (assignment.Operator.UserId != currentUserId)
            return Result<Guid>.Failure("You are not authorized to start this assignment.");

        if (assignment.AssignmentStatus != AssignmentStatus.Accepted)
            return Result<Guid>.Failure("Only accepted assignments can be started.");

        if (request.StartMeterReading < 0)
            return Result<Guid>.Failure("Start meter reading cannot be negative.");

        var rental = assignment.RentalBooking;
        if (rental == null)
            return Result<Guid>.Failure("Rental booking associated with this assignment was not found.");

        var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(rental.AssetId);
        if (asset == null)
            return Result<Guid>.Failure("Asset associated with this rental was not found.");

        try
        {
            // Transition Assignment
            assignment.Start(request.ActualStartDateTime, request.StartMeterReading, request.Remarks);

            // Transition Rental Status
            if (rental.Status == RentalStatus.Confirmed)
            {
                rental.Dispatch();
            }

            if (rental.Status == RentalStatus.Dispatched)
            {
                rental.Activate(request.StartMeterReading);
            }
            else if (rental.Status != RentalStatus.Active)
            {
                return Result<Guid>.Failure($"Rental is in an invalid status to be started: {rental.Status}");
            }

            // Rent the asset
            if (asset.Status == AssetStatus.Available)
            {
                asset.Rent();
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

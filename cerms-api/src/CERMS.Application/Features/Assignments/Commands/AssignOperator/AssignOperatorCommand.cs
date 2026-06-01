using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Assignments.Commands.AssignOperator;

public record AssignOperatorCommand(Guid RentalId, Guid OperatorId) : IRequest<Result<Guid>>;

public class AssignOperatorHandler : IRequestHandler<AssignOperatorCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;

    public AssignOperatorHandler(IUnitOfWork unitOfWork, ICurrentTenantService currentTenantService)
    {
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
    }

    public async Task<Result<Guid>> Handle(AssignOperatorCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.RentalId);
        if (rental == null) return Result<Guid>.Failure("Rental booking not found.");

        var op = await _unitOfWork.Repository<Operator>().GetByIdAsync(request.OperatorId);
        if (op == null) return Result<Guid>.Failure("Operator not found.");
        if (!op.IsActive) return Result<Guid>.Failure("Operator is currently inactive.");

        // Remove any existing active assignments for this rental to allow clean reassignment
        var existingAssignments = await _unitOfWork.Repository<RentalAssignment>().Entities
            .Where(ra => ra.RentalId == request.RentalId && ra.AssignmentStatus != AssignmentStatus.Closed)
            .ToListAsync(cancellationToken);
        
        foreach (var existing in existingAssignments)
        {
            _unitOfWork.Repository<RentalAssignment>().Delete(existing);
        }

        var currentUserId = _currentTenantService.UserId;

        try
        {
            var assignment = new RentalAssignment(request.RentalId, request.OperatorId, currentUserId);
            
            // Sync with rental status: Assigned -> Rental status = Confirmed
            if (rental.Status == RentalStatus.Draft)
            {
                rental.Confirm();
                _unitOfWork.Repository<RentalBooking>().Update(rental);
            }
            else if (rental.Status == RentalStatus.Confirmed)
            {
                rental.Dispatch();
                _unitOfWork.Repository<RentalBooking>().Update(rental);
            }

            await _unitOfWork.Repository<RentalAssignment>().AddAsync(assignment);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(assignment.Id);
        }
        catch (Exception ex)
        {
            return Result<Guid>.Failure(ex.Message);
        }
    }
}

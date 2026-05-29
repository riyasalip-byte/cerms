using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Assignments.Commands.AcceptAssignment;

public record AcceptAssignmentCommand(Guid AssignmentId) : IRequest<Result<Guid>>;

public class AcceptAssignmentHandler : IRequestHandler<AcceptAssignmentCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;

    public AcceptAssignmentHandler(IUnitOfWork unitOfWork, ICurrentTenantService currentTenantService)
    {
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
    }

    public async Task<Result<Guid>> Handle(AcceptAssignmentCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _unitOfWork.Repository<RentalAssignment>().Entities
            .Include(ra => ra.Operator)
            .FirstOrDefaultAsync(ra => ra.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
            return Result<Guid>.Failure("Assignment not found.");

        var currentUserId = _currentTenantService.UserId;
        if (assignment.Operator.UserId != currentUserId)
            return Result<Guid>.Failure("You are not authorized to accept this assignment.");

        try
        {
            assignment.Accept();
            _unitOfWork.Repository<RentalAssignment>().Update(assignment);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(assignment.Id);
        }
        catch (Exception ex)
        {
            return Result<Guid>.Failure(ex.Message);
        }
    }
}

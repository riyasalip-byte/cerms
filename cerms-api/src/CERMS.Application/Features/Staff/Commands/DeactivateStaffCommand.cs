using StaffEntity = CERMS.Domain.Entities.Staff;
using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Staff.Commands;

public record DeactivateStaffCommand(Guid Id) : IRequest<Result>;

public class DeactivateStaffHandler : IRequestHandler<DeactivateStaffCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeactivateStaffHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeactivateStaffCommand request, CancellationToken cancellationToken)
    {
        var staff = await _unitOfWork.Repository<StaffEntity>().Entities
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (staff is null)
            return Result.Failure("Staff not found.");

        staff.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

using StaffEntity = CERMS.Domain.Entities.Staff;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Staff.Queries;

public record GetStaffWithoutUserQuery : IRequest<Result<List<StaffLookupDto>>>;

public class GetStaffWithoutUserHandler : IRequestHandler<GetStaffWithoutUserQuery, Result<List<StaffLookupDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetStaffWithoutUserHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<StaffLookupDto>>> Handle(GetStaffWithoutUserQuery request, CancellationToken cancellationToken)
    {
        var linkedStaffIds = _unitOfWork.Repository<User>().Entities.Select(u => u.StaffId);

        var items = await _unitOfWork.Repository<StaffEntity>().Entities
            .Where(s => s.UserId == null && !linkedStaffIds.Contains(s.Id))
            .OrderBy(s => s.DisplayName)
            .Select(s => new StaffLookupDto
            {
                Id = s.Id,
                StaffCode = s.StaffCode,
                DisplayName = s.DisplayName,
                EmployeeCategory = s.EmployeeCategory
            })
            .ToListAsync(cancellationToken);

        return Result<List<StaffLookupDto>>.Success(items);
    }
}

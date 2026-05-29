using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Users.Queries;

public record GetMyProfileQuery : IRequest<Result<ProfileDto>>;

public class GetMyProfileHandler : IRequestHandler<GetMyProfileQuery, Result<ProfileDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _tenantService;

    public GetMyProfileHandler(IUnitOfWork unitOfWork, ICurrentTenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _tenantService = tenantService;
    }

    public async Task<Result<ProfileDto>> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        if (_tenantService.UserId is null)
            return Result<ProfileDto>.Failure("Unauthorized.");

        var user = await _unitOfWork.Repository<User>().Entities
            .Include(u => u.Role)
            .Include(u => u.Staff)
            .FirstOrDefaultAsync(u => u.Id == _tenantService.UserId, cancellationToken);

        if (user is null)
            return Result<ProfileDto>.Failure("User not found.");

        var staff = user.Staff;
        return Result<ProfileDto>.Success(new ProfileDto
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.Name,
            StaffId = staff.Id,
            StaffCode = staff.StaffCode,
            DisplayName = staff.DisplayName,
            FirstName = staff.FirstName,
            LastName = staff.LastName,
            MobileNo = staff.MobileNo,
            PhotoUrl = staff.PhotoUrl,
            EmployeeCategory = staff.EmployeeCategory,
            Designation = staff.Designation,
            Department = staff.Department
        });
    }
}

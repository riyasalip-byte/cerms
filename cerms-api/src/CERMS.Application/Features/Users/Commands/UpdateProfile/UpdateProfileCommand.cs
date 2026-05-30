using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Users.Commands.UpdateProfile;

public record UpdateProfileCommand(
    string Username,
    string Email,
    string DisplayName,
    string MobileNo,
    string? PhotoUrl) : IRequest<Result<ProfileDto>>;

public class UpdateProfileHandler : IRequestHandler<UpdateProfileCommand, Result<ProfileDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentTenantService _tenantService;

    public UpdateProfileHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentTenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _tenantService = tenantService;
    }

    public async Task<Result<ProfileDto>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        if (_tenantService.UserId is null)
            return Result<ProfileDto>.Failure("Unauthorized.");

        var user = await _unitOfWork.Repository<User>().Entities
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Staff)
            .FirstOrDefaultAsync(u => u.Id == _tenantService.UserId, cancellationToken);

        if (user is null)
            return Result<ProfileDto>.Failure("User not found.");

        user.UpdateProfile(request.Username.Trim(), request.Email.Trim());

        var staff = user.Staff;
        staff.UpdateDetails(
            staff.FirstName,
            staff.LastName,
            request.DisplayName.Trim(),
            staff.Gender,
            staff.DateOfBirth,
            request.MobileNo.Trim(),
            staff.AlternateMobileNo,
            request.Email.Trim(),
            staff.AddressLine1,
            staff.AddressLine2,
            staff.City,
            staff.State,
            staff.Pincode,
            staff.EmergencyContactName,
            staff.EmergencyContactNumber,
            staff.EmployeeCategory,
            staff.JoiningDate,
            staff.RelievingDate,
            staff.EmploymentStatus,
            staff.Designation,
            staff.Department,
            request.PhotoUrl);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

using StaffEntity = CERMS.Domain.Entities.Staff;
using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Staff.Commands;

public record UpdateStaffCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string DisplayName,
    string Gender,
    DateTime DateOfBirth,
    string MobileNo,
    string? AlternateMobileNo,
    string Email,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string Pincode,
    string EmergencyContactName,
    string EmergencyContactNumber,
    EmployeeCategory EmployeeCategory,
    DateTime JoiningDate,
    DateTime? RelievingDate,
    EmploymentStatus EmploymentStatus,
    string Designation,
    string Department,
    string? PhotoUrl,
    string? LicenseNumber,
    string? LicenseCategory,
    DateTime? LicenseExpiryDate,
    int? ExperienceYears,
    string? OperatorGrade,
    decimal? DailyWage,
    decimal? Salary,
    string? AadhaarNo,
    string? PANNo,
    string? LicenseDocumentUrl,
    string? IdProofUrl,
    string? Remarks,
    List<Guid>? AllowedAssetClassIds) : IRequest<Result<StaffDetailDto>>;

public class UpdateStaffHandler : IRequestHandler<UpdateStaffCommand, Result<StaffDetailDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateStaffHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<StaffDetailDto>> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
    {
        var staff = await _unitOfWork.Repository<StaffEntity>().Entities
            .Include(s => s.AllowedAssetClasses)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (staff is null)
            return Result<StaffDetailDto>.Failure("Staff not found.");

        staff.UpdateDetails(
            request.FirstName.Trim(),
            request.LastName.Trim(),
            request.DisplayName.Trim(),
            request.Gender.Trim(),
            request.DateOfBirth,
            request.MobileNo.Trim(),
            request.AlternateMobileNo?.Trim(),
            request.Email.Trim(),
            request.AddressLine1.Trim(),
            request.AddressLine2?.Trim(),
            request.City.Trim(),
            request.State.Trim(),
            request.Pincode.Trim(),
            request.EmergencyContactName.Trim(),
            request.EmergencyContactNumber.Trim(),
            request.EmployeeCategory,
            request.JoiningDate,
            request.RelievingDate,
            request.EmploymentStatus,
            request.Designation.Trim(),
            request.Department.Trim(),
            request.PhotoUrl);

        if (request.EmployeeCategory == EmployeeCategory.Operator)
        {
            staff.ConfigureOperatorDetails(
                request.LicenseNumber?.Trim(),
                request.LicenseCategory?.Trim(),
                request.LicenseExpiryDate,
                request.ExperienceYears,
                request.OperatorGrade?.Trim());
        }
        else
        {
            staff.ConfigureOperatorDetails(null, null, null, null, null);
        }

        staff.UpdateFinancialsAndIdentity(
            request.DailyWage,
            request.Salary,
            request.AadhaarNo?.Trim(),
            request.PANNo?.Trim(),
            request.Remarks?.Trim(),
            request.LicenseDocumentUrl,
            request.IdProofUrl);

        staff.AllowedAssetClasses.Clear();
        if (request.AllowedAssetClassIds is not null)
        {
            foreach (var assetClassId in request.AllowedAssetClassIds.Distinct())
            {
                staff.AllowedAssetClasses.Add(new StaffAssetClass
                {
                    StaffId = staff.Id,
                    AssetClassId = assetClassId
                });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _unitOfWork.Repository<StaffEntity>().Entities
            .Include(s => s.AllowedAssetClasses)
            .ThenInclude(sa => sa.AssetClass)
            .FirstAsync(s => s.Id == staff.Id, cancellationToken);

        return Result<StaffDetailDto>.Success(_mapper.Map<StaffDetailDto>(updated));
    }
}

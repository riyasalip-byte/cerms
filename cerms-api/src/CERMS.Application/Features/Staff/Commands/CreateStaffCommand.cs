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

public record CreateStaffCommand(
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

public class CreateStaffHandler : IRequestHandler<CreateStaffCommand, Result<StaffDetailDto>>
{
    private const string StaffCodePrefix = "STF-";

    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateStaffHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<StaffDetailDto>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
    {
        var staffCode = await GenerateStaffCodeAsync(cancellationToken);

        var staff = new StaffEntity(
            staffCode,
            request.FirstName.Trim(),
            request.LastName.Trim(),
            request.DisplayName.Trim(),
            request.Gender.Trim(),
            request.DateOfBirth,
            request.MobileNo.Trim(),
            request.Email.Trim(),
            request.AddressLine1.Trim(),
            request.City.Trim(),
            request.State.Trim(),
            request.Pincode.Trim(),
            request.EmergencyContactName.Trim(),
            request.EmergencyContactNumber.Trim(),
            request.EmployeeCategory,
            request.JoiningDate,
            request.Designation.Trim(),
            request.Department.Trim(),
            request.PhotoUrl);

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
            null,
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

        staff.UpdateFinancialsAndIdentity(
            request.DailyWage,
            request.Salary,
            request.AadhaarNo?.Trim(),
            request.PANNo?.Trim(),
            request.Remarks?.Trim(),
            request.LicenseDocumentUrl,
            request.IdProofUrl);

        if (request.AllowedAssetClassIds is not null)
        {
            foreach (var assetClassId in request.AllowedAssetClassIds.Distinct())
            {
                staff.AllowedAssetClasses.Add(new StaffAssetClass { AssetClassId = assetClassId });
            }
        }

        await _unitOfWork.Repository<StaffEntity>().AddAsync(staff);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await LoadStaffDetailAsync(staff.Id, cancellationToken);
        return Result<StaffDetailDto>.Success(_mapper.Map<StaffDetailDto>(created!));
    }

    private async Task<string> GenerateStaffCodeAsync(CancellationToken cancellationToken)
    {
        var codes = await _unitOfWork.Repository<StaffEntity>().Entities
            .Where(s => s.StaffCode.StartsWith(StaffCodePrefix))
            .Select(s => s.StaffCode)
            .ToListAsync(cancellationToken);

        var next = codes
            .Select(code =>
            {
                var part = code[StaffCodePrefix.Length..];
                return int.TryParse(part, out var n) ? n : 0;
            })
            .DefaultIfEmpty(0)
            .Max() + 1;

        return $"{StaffCodePrefix}{next:0000}";
    }

    private async Task<StaffEntity?> LoadStaffDetailAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _unitOfWork.Repository<StaffEntity>().Entities
            .Include(s => s.AllowedAssetClasses)
            .ThenInclude(sa => sa.AssetClass)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }
}

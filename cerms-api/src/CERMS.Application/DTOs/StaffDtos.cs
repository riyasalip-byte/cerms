using CERMS.Application.Common.DTOs;
using CERMS.Domain.Enums;

namespace CERMS.Application.DTOs;

public class StaffDto
{
    public Guid Id { get; set; }
    public string StaffCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public EmployeeCategory EmployeeCategory { get; set; }
    public string MobileNo { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public EmploymentStatus EmploymentStatus { get; set; }
    public bool HasUserAccount { get; set; }
}

public class StaffDetailDto : StaffDto
{
    public string Gender { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string? PhotoUrl { get; set; }
    public string? AlternateMobileNo { get; set; }
    public string Email { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactNumber { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public DateTime? RelievingDate { get; set; }
    public string Department { get; set; } = string.Empty;
    public string? LicenseNumber { get; set; }
    public string? LicenseCategory { get; set; }
    public DateTime? LicenseExpiryDate { get; set; }
    public int? ExperienceYears { get; set; }
    public string? OperatorGrade { get; set; }
    public decimal? DailyWage { get; set; }
    public decimal? Salary { get; set; }
    public string? AadhaarNo { get; set; }
    public string? PANNo { get; set; }
    public string? LicenseDocumentUrl { get; set; }
    public string? IdProofUrl { get; set; }
    public string? Remarks { get; set; }
    public List<AssetClassDto> AllowedAssetClasses { get; set; } = new();
    public Guid? LinkedUserId { get; set; }
}

public class AssetClassDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}



public class StaffLookupDto
{
    public Guid Id { get; set; }
    public string StaffCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public EmployeeCategory EmployeeCategory { get; set; }
}

public class StaffInsightsDto
{
    public int TotalStaff { get; set; }
    public int ActiveOperators { get; set; }
    public int ExpiringLicenses { get; set; }
    public List<ChartDataDto> OperatorsByAssetClass { get; set; } = new();
}

public class ProfileDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public Guid StaffId { get; set; }
    public string StaffCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string MobileNo { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public EmployeeCategory EmployeeCategory { get; set; }
    public string Designation { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}

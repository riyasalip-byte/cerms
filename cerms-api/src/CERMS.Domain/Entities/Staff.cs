using CERMS.Domain.Common;
using CERMS.Domain.Enums;
using System;
using System.Collections.Generic;

namespace CERMS.Domain.Entities;

public class Staff : BaseEntity
{
    // Basic Details
    public string StaffCode { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string DisplayName { get; private set; }
    public string Gender { get; private set; }
    public DateTime DateOfBirth { get; private set; }
    public string? PhotoUrl { get; private set; }

    // Contact Details
    public string MobileNo { get; private set; }
    public string? AlternateMobileNo { get; private set; }
    public string Email { get; private set; }

    // Address
    public string AddressLine1 { get; private set; }
    public string? AddressLine2 { get; private set; }
    public string City { get; private set; }
    public string State { get; private set; }
    public string Pincode { get; private set; }

    // Emergency Contact
    public string EmergencyContactName { get; private set; }
    public string EmergencyContactNumber { get; private set; }

    // Employment details
    public EmployeeCategory EmployeeCategory { get; private set; }
    public DateTime JoiningDate { get; private set; }
    public DateTime? RelievingDate { get; private set; }
    public EmploymentStatus EmploymentStatus { get; private set; }
    public string Designation { get; private set; }
    public string Department { get; private set; }

    // Operator Details (Only applicable if category == Operator)
    public string? LicenseNumber { get; private set; }
    public string? LicenseCategory { get; private set; }
    public DateTime? LicenseExpiryDate { get; private set; }
    public int? ExperienceYears { get; private set; }
    public string? OperatorGrade { get; private set; }

    // Financial & Identity (Optional)
    public decimal? DailyWage { get; private set; }
    public decimal? Salary { get; private set; }
    public string? AadhaarNo { get; private set; }
    public string? PANNo { get; private set; }

    // Documents (Urls/Paths)
    public string? LicenseDocumentUrl { get; private set; }
    public string? IdProofUrl { get; private set; }
    public string? Remarks { get; private set; }

    // Junction list
    public ICollection<StaffAssetClass> AllowedAssetClasses { get; private set; } = new List<StaffAssetClass>();
    
    // Linked User ID (One Staff = Max One User)
    public Guid? UserId { get; set; }

    protected Staff() { }

    public Staff(
        string staffCode, string firstName, string lastName, string displayName, string gender, DateTime dob,
        string mobileNo, string email, string addressLine1, string city, string state, string pincode,
        string emergencyContactName, string emergencyContactNumber, EmployeeCategory employeeCategory,
        DateTime joiningDate, string designation, string department, string? photoUrl = null)
    {
        StaffCode = staffCode;
        FirstName = firstName;
        LastName = lastName;
        DisplayName = displayName;
        Gender = gender;
        DateOfBirth = dob;
        MobileNo = mobileNo;
        Email = email;
        AddressLine1 = addressLine1;
        City = city;
        State = state;
        Pincode = pincode;
        EmergencyContactName = emergencyContactName;
        EmergencyContactNumber = emergencyContactNumber;
        EmployeeCategory = employeeCategory;
        JoiningDate = joiningDate;
        EmploymentStatus = EmploymentStatus.Active;
        Designation = designation;
        Department = department;
        PhotoUrl = photoUrl;
    }

    public void ConfigureOperatorDetails(string? licenseNumber, string? licenseCategory, DateTime? expiryDate, int? years, string? grade)
    {
        LicenseNumber = licenseNumber;
        LicenseCategory = licenseCategory;
        LicenseExpiryDate = expiryDate;
        ExperienceYears = years;
        OperatorGrade = grade;
    }

    public void UpdateFinancialsAndIdentity(decimal? dailyWage, decimal? salary, string? aadhaar, string? pan, string? remarks = null, string? licenseDoc = null, string? idProof = null)
    {
        DailyWage = dailyWage;
        Salary = salary;
        AadhaarNo = aadhaar;
        PANNo = pan;
        Remarks = remarks;
        LicenseDocumentUrl = licenseDoc;
        IdProofUrl = idProof;
    }

    public void UpdateDetails(
        string firstName, string lastName, string displayName, string gender, DateTime dob,
        string mobileNo, string? alternateMobile, string email, string addressLine1, string? addressLine2, string city, string state, string pincode,
        string emergencyContactName, string emergencyContactNumber, EmployeeCategory employeeCategory,
        DateTime joiningDate, DateTime? relievingDate, EmploymentStatus status, string designation, string department, string? photoUrl = null)
    {
        FirstName = firstName;
        LastName = lastName;
        DisplayName = displayName;
        Gender = gender;
        DateOfBirth = dob;
        MobileNo = mobileNo;
        AlternateMobileNo = alternateMobile;
        Email = email;
        AddressLine1 = addressLine1;
        AddressLine2 = addressLine2;
        City = city;
        State = state;
        Pincode = pincode;
        EmergencyContactName = emergencyContactName;
        EmergencyContactNumber = emergencyContactNumber;
        EmployeeCategory = employeeCategory;
        JoiningDate = joiningDate;
        RelievingDate = relievingDate;
        EmploymentStatus = status;
        Designation = designation;
        Department = department;
        PhotoUrl = photoUrl;
        Update();
    }

    public void Deactivate()
    {
        EmploymentStatus = EmploymentStatus.Inactive;
        Update();
    }

    public void Activate()
    {
        EmploymentStatus = EmploymentStatus.Active;
        Update();
    }
}

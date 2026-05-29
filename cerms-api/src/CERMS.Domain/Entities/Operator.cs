using CERMS.Domain.Common;
using System;
using System.Collections.Generic;

namespace CERMS.Domain.Entities;

public class Operator : BaseEntity
{
    public string OperatorCode { get; private set; }
    public string FullName { get; private set; }
    public string MobileNo { get; private set; }
    public string? AlternateMobileNo { get; private set; }
    public string? Address { get; private set; }
    
    public string LicenseNumber { get; private set; }
    public DateTime LicenseExpiryDate { get; private set; }
    
    public DateTime JoiningDate { get; private set; }
    public decimal DailyWage { get; private set; }
    public bool IsActive { get; private set; }
    
    public Guid? UserId { get; private set; }

    private readonly List<RentalAssignment> _assignments = new();
    public IReadOnlyCollection<RentalAssignment> Assignments => _assignments.AsReadOnly();

    protected Operator() { } // Parameterless constructor for EF Core

    public Operator(
        string operatorCode,
        string fullName,
        string mobileNo,
        string licenseNumber,
        DateTime licenseExpiryDate,
        DateTime joiningDate,
        decimal dailyWage,
        string? alternateMobileNo = null,
        string? address = null,
        Guid? userId = null)
    {
        if (string.IsNullOrWhiteSpace(operatorCode)) throw new ArgumentException("Operator code is required.", nameof(operatorCode));
        if (string.IsNullOrWhiteSpace(fullName)) throw new ArgumentException("Full name is required.", nameof(fullName));
        if (string.IsNullOrWhiteSpace(mobileNo)) throw new ArgumentException("Mobile number is required.", nameof(mobileNo));
        if (string.IsNullOrWhiteSpace(licenseNumber)) throw new ArgumentException("License number is required.", nameof(licenseNumber));
        if (dailyWage < 0) throw new ArgumentException("Daily wage cannot be negative.", nameof(dailyWage));

        OperatorCode = operatorCode;
        FullName = fullName;
        MobileNo = mobileNo;
        LicenseNumber = licenseNumber;
        LicenseExpiryDate = licenseExpiryDate;
        JoiningDate = joiningDate;
        DailyWage = dailyWage;
        AlternateMobileNo = alternateMobileNo;
        Address = address;
        UserId = userId;
        IsActive = true;
    }

    public void UpdateDetails(
        string fullName,
        string mobileNo,
        string licenseNumber,
        DateTime licenseExpiryDate,
        DateTime joiningDate,
        decimal dailyWage,
        string? alternateMobileNo,
        string? address)
    {
        if (string.IsNullOrWhiteSpace(fullName)) throw new ArgumentException("Full name is required.", nameof(fullName));
        if (string.IsNullOrWhiteSpace(mobileNo)) throw new ArgumentException("Mobile number is required.", nameof(mobileNo));
        if (string.IsNullOrWhiteSpace(licenseNumber)) throw new ArgumentException("License number is required.", nameof(licenseNumber));
        if (dailyWage < 0) throw new ArgumentException("Daily wage cannot be negative.", nameof(dailyWage));

        FullName = fullName;
        MobileNo = mobileNo;
        LicenseNumber = licenseNumber;
        LicenseExpiryDate = licenseExpiryDate;
        JoiningDate = joiningDate;
        DailyWage = dailyWage;
        AlternateMobileNo = alternateMobileNo;
        Address = address;
        Update();
    }

    public void LinkUser(Guid userId)
    {
        UserId = userId;
        Update();
    }

    public void Deactivate()
    {
        IsActive = false;
        Update();
    }

    public void Activate()
    {
        IsActive = true;
        Update();
    }
}

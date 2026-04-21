using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class StaffMember : BaseEntity
{
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string EmployeeCode { get; private set; }
    public Guid? UserId { get; private set; }
    public decimal MonthlySalary { get; private set; }
    public string? LicenceNumber { get; private set; }
    public DateTime? LicenceExpiryDate { get; private set; }

    public StaffMember(string firstName, string lastName, string employeeCode, decimal monthlySalary = 0, Guid? userId = null)
    {
        FirstName = firstName;
        LastName = lastName;
        EmployeeCode = employeeCode;
        MonthlySalary = monthlySalary;
        UserId = userId;
    }

    public void LinkUser(Guid userId)
    {
        UserId = userId;
        Update();
    }

    public void UpdateLicence(string? licenceNumber, DateTime? expiryDate)
    {
        LicenceNumber = licenceNumber;
        LicenceExpiryDate = expiryDate;
        Update();
    }
}

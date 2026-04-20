using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class StaffMember : BaseEntity
{
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string EmployeeCode { get; private set; }
    public Guid? UserId { get; private set; }

    public StaffMember(string firstName, string lastName, string employeeCode, Guid? userId = null)
    {
        FirstName = firstName;
        LastName = lastName;
        EmployeeCode = employeeCode;
        UserId = userId;
    }

    public void LinkUser(Guid userId)
    {
        UserId = userId;
        Update();
    }
}

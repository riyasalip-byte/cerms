using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class Customer : BaseEntity
{
    public string Name { get; private set; }
    public string Phone { get; private set; }
    public string Email { get; private set; }

    public Customer(string name, string phone, string email)
    {
        Name = name;
        Phone = phone;
        Email = email;
    }

    public void UpdateContactInfo(string phone, string email)
    {
        Phone = phone;
        Email = email;
        Update();
    }
}

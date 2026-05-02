using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class Customer : BaseEntity
{
    public string CustomerCode { get; private set; }
    public string Name { get; private set; }
    public string Phone { get; private set; }
    public string? Email { get; private set; }
    public string? Address { get; private set; }
    
    public string? CompanyName { get; private set; }
    public string? IDProofNumber { get; private set; }
    
    public bool IsActive { get; private set; }

    private readonly List<RentalBooking> _rentalBookings = new();
    public IReadOnlyCollection<RentalBooking> RentalBookings => _rentalBookings.AsReadOnly();

    private Customer() { } // EF Core

    public Customer(string customerCode, string name, string phone, string? email = null, string? address = null, string? companyName = null, string? idProofNumber = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required", nameof(name));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("Phone is required", nameof(phone));
        if (string.IsNullOrWhiteSpace(customerCode)) throw new ArgumentException("CustomerCode is required", nameof(customerCode));

        CustomerCode = customerCode;
        Name = name;
        Phone = phone;
        Email = email;
        Address = address;
        CompanyName = companyName;
        IDProofNumber = idProofNumber;
        IsActive = true;
    }

    public void UpdateDetails(string name, string phone, string? email, string? address, string? companyName, string? idProofNumber)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required", nameof(name));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("Phone is required", nameof(phone));

        Name = name;
        Phone = phone;
        Email = email;
        Address = address;
        CompanyName = companyName;
        IDProofNumber = idProofNumber;
        
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

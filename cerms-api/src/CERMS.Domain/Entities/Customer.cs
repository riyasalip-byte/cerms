using CERMS.Domain.Common;
using CERMS.Domain.Enums;

namespace CERMS.Domain.Entities;

public class Customer : BaseEntity
{
    // Core
    public string CustomerCode { get; private set; }
    public CustomerType CustomerType { get; private set; }
    public string CustomerName { get; private set; }

    // Contact
    public string? Address { get; private set; }
    public string MobileNo { get; private set; }
    public string? AlternateMobileNo { get; private set; }
    public string? Email { get; private set; }
    public string? WhatsAppNo { get; private set; }

    // Location
    public string? City { get; private set; }
    public string? State { get; private set; }
    public string? Pincode { get; private set; }

    // Company Info
    public string? ContactPersonName { get; private set; }
    public string? ContactPersonMobileNo { get; private set; }
    public string? ContactPersonAddress { get; private set; }
    public string? GstOrTaxNumber { get; private set; }

    // Financial
    public decimal CreditLimit { get; private set; }
    public decimal OutstandingBalance { get; private set; }

    // Additional
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<RentalBooking> _rentalBookings = new();
    public IReadOnlyCollection<RentalBooking> RentalBookings => _rentalBookings.AsReadOnly();

    private Customer() { } // EF Core

    public Customer(
        string customerCode,
        CustomerType customerType,
        string customerName,
        string mobileNo,
        string? address = null,
        string? alternateMobileNo = null,
        string? email = null,
        string? whatsAppNo = null,
        string? city = null,
        string? state = null,
        string? pincode = null,
        string? contactPersonName = null,
        string? contactPersonMobileNo = null,
        string? contactPersonAddress = null,
        string? gstOrTaxNumber = null,
        decimal creditLimit = 0,
        decimal outstandingBalance = 0,
        string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(customerCode)) throw new ArgumentException("CustomerCode is required", nameof(customerCode));
        if (string.IsNullOrWhiteSpace(customerName)) throw new ArgumentException("CustomerName is required", nameof(customerName));
        if (string.IsNullOrWhiteSpace(mobileNo)) throw new ArgumentException("MobileNo is required", nameof(mobileNo));

        if (customerType == CustomerType.Company)
        {
            if (string.IsNullOrWhiteSpace(contactPersonName)) throw new ArgumentException("ContactPersonName is required for Company customers", nameof(contactPersonName));
            if (string.IsNullOrWhiteSpace(contactPersonMobileNo)) throw new ArgumentException("ContactPersonMobileNo is required for Company customers", nameof(contactPersonMobileNo));
        }

        CustomerCode = customerCode;
        CustomerType = customerType;
        CustomerName = customerName;
        MobileNo = mobileNo;
        Address = address;
        AlternateMobileNo = alternateMobileNo;
        Email = email;
        WhatsAppNo = whatsAppNo;
        City = city;
        State = state;
        Pincode = pincode;
        ContactPersonName = contactPersonName;
        ContactPersonMobileNo = contactPersonMobileNo;
        ContactPersonAddress = contactPersonAddress;
        GstOrTaxNumber = gstOrTaxNumber;
        CreditLimit = creditLimit;
        OutstandingBalance = outstandingBalance;
        Notes = notes;
        IsActive = true;
    }

    public void UpdateDetails(
        CustomerType customerType,
        string customerName,
        string mobileNo,
        string? address,
        string? alternateMobileNo,
        string? email,
        string? whatsAppNo,
        string? city,
        string? state,
        string? pincode,
        string? contactPersonName,
        string? contactPersonMobileNo,
        string? contactPersonAddress,
        string? gstOrTaxNumber,
        decimal creditLimit,
        decimal outstandingBalance,
        string? notes)
    {
        if (string.IsNullOrWhiteSpace(customerName)) throw new ArgumentException("CustomerName is required", nameof(customerName));
        if (string.IsNullOrWhiteSpace(mobileNo)) throw new ArgumentException("MobileNo is required", nameof(mobileNo));

        if (customerType == CustomerType.Company)
        {
            if (string.IsNullOrWhiteSpace(contactPersonName)) throw new ArgumentException("ContactPersonName is required for Company customers", nameof(contactPersonName));
            if (string.IsNullOrWhiteSpace(contactPersonMobileNo)) throw new ArgumentException("ContactPersonMobileNo is required for Company customers", nameof(contactPersonMobileNo));
        }

        CustomerType = customerType;
        CustomerName = customerName;
        MobileNo = mobileNo;
        Address = address;
        AlternateMobileNo = alternateMobileNo;
        Email = email;
        WhatsAppNo = whatsAppNo;
        City = city;
        State = state;
        Pincode = pincode;
        ContactPersonName = contactPersonName;
        ContactPersonMobileNo = contactPersonMobileNo;
        ContactPersonAddress = contactPersonAddress;
        GstOrTaxNumber = gstOrTaxNumber;
        CreditLimit = creditLimit;
        OutstandingBalance = outstandingBalance;
        Notes = notes;
        
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

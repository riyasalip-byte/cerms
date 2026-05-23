using CERMS.Domain.Enums;

namespace CERMS.Application.DTOs;

public class CustomerDetailDto
{
    // Core
    public Guid Id { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public CustomerType CustomerType { get; set; }
    public string CustomerName { get; set; } = string.Empty;

    // Contact
    public string? Address { get; set; }
    public string MobileNo { get; set; } = string.Empty;
    public string? AlternateMobileNo { get; set; }
    public string? Email { get; set; }
    public string? WhatsAppNo { get; set; }

    // Location
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }

    // Company Info
    public string? ContactPersonName { get; set; }
    public string? ContactPersonMobileNo { get; set; }
    public string? ContactPersonAddress { get; set; }
    public string? GstOrTaxNumber { get; set; }

    // Financial
    public decimal CreditLimit { get; set; }
    public decimal OutstandingBalance { get; set; }

    // Status & Audit
    public string? Notes { get; set; }
    public bool IsActive { get; set; }

    // Metrics
    public int TotalRentalsCount { get; set; }
    public decimal TotalRevenue { get; set; }

    // Lists
    public List<CustomerRentalSummaryDto> RentalHistory { get; set; } = new();
}

public class CustomerRentalSummaryDto
{
    public Guid RentalId { get; set; }
    public Guid? InvoiceId { get; set; }
    public string RentalNo { get; set; } = string.Empty;
    public string AssetName { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public RentalStatus Status { get; set; }
    public decimal TotalBillAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount { get; set; }
}

using CERMS.Domain.Enums;

namespace CERMS.Application.DTOs;

public class CustomerDetailDto
{
    public Guid Id { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public bool IsActive { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public int TotalRentalsCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<CustomerRentalSummaryDto> RentalHistory { get; set; } = new();
}

public class CustomerRentalSummaryDto
{
    public Guid RentalId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public RentalStatus Status { get; set; }
    public decimal? TotalAmount { get; set; }
}

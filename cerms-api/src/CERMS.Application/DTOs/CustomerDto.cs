using CERMS.Domain.Enums;

namespace CERMS.Application.DTOs;

public class CustomerDto
{
    public Guid Id { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public CustomerType CustomerType { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string MobileNo { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? City { get; set; }
    public decimal OutstandingBalance { get; set; }
    public bool IsActive { get; set; }
}

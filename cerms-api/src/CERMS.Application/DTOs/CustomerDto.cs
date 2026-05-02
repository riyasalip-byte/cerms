namespace CERMS.Application.DTOs;

public class CustomerDto
{
    public Guid Id { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? CompanyName { get; set; }
    public bool IsActive { get; set; }
}

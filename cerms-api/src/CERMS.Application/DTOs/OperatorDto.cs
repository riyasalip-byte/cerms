using System;

namespace CERMS.Application.DTOs;

public class OperatorDto
{
    public Guid Id { get; set; }
    public string OperatorCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string MobileNo { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public decimal DailyWage { get; set; }
    public bool IsActive { get; set; }
}

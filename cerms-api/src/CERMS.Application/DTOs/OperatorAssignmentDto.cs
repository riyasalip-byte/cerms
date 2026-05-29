using CERMS.Domain.Enums;
using System;

namespace CERMS.Application.DTOs;

public class OperatorAssignmentDto
{
    public Guid Id { get; set; }
    public Guid RentalId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string AssetName { get; set; } = string.Empty;
    public string AssetCode { get; set; } = string.Empty;
    public string SiteName { get; set; } = string.Empty;
    public string SiteAddress { get; set; } = string.Empty;
    
    public DateTime StartDateTime { get; set; }
    public DateTime ExpectedEndDateTime { get; set; }
    public DateTime? ActualEndDateTime { get; set; }
    
    public RateType? RateType { get; set; }
    public decimal? RateAmount { get; set; }
    
    public AssignmentStatus AssignmentStatus { get; set; }
    public DateTime AssignedAt { get; set; }
    
    public DateTime? ActualStartDateTime { get; set; }
    public decimal? StartMeterReading { get; set; }
    public decimal? EndMeterReading { get; set; }
    
    public string? StartRemarks { get; set; }
    public string? CompletionRemarks { get; set; }
    
    public bool IsInvoiceGenerated { get; set; }
    public DateTime? InvoiceGeneratedAt { get; set; }
    
    // Transport fields from booking
    public decimal? PickupTransportCharge { get; set; }
    public decimal? ReturnTransportCharge { get; set; }

    // Operator Details
    public Guid OperatorId { get; set; }
    public string OperatorName { get; set; } = string.Empty;
    public string OperatorCode { get; set; } = string.Empty;
    public string OperatorMobile { get; set; } = string.Empty;

    public Guid? InvoiceId { get; set; }
}

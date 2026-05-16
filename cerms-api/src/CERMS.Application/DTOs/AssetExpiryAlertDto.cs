namespace CERMS.Application.DTOs;

public class AssetExpiryAlertDto
{
    public Guid AssetId { get; set; }
    public string AssetCode { get; set; } = string.Empty;
    public string AssetName { get; set; } = string.Empty;
    public string RegisterNo { get; set; } = string.Empty;
    public string ComplianceType { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public int DaysUntilExpiry { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string NotificationKey { get; set; } = string.Empty;
}

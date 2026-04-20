using CERMS.Domain.Enums;

namespace CERMS.Application.DTOs;

public class AssetDto
{
    public Guid Id { get; set; }
    public string AssetCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public AssetStatus Status { get; set; }
    public decimal CurrentOdometer { get; set; }
}

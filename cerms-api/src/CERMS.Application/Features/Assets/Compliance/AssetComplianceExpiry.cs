using CERMS.Application.DTOs;
using CERMS.Domain.Entities;

namespace CERMS.Application.Features.Assets.Compliance;

public static class AssetComplianceExpiry
{
    public const string Critical = "critical";
    public const string Warning = "warning";

    public static IReadOnlyList<AssetExpiryAlertDto> Evaluate(Asset asset, DateTime today, int warningWindowDays = 30)
    {
        var normalizedToday = today.Date;

        return new[]
            {
                CreateAlert(asset, "Fitness", asset.FitnessExpiryDate, normalizedToday, warningWindowDays),
                CreateAlert(asset, "Insurance", asset.InsuranceExpiryDate, normalizedToday, warningWindowDays),
                CreateAlert(asset, "PUCC", asset.PuccExpiryDate, normalizedToday, warningWindowDays),
            }
            .Where(alert => alert is not null)
            .Select(alert => alert!)
            .ToList();
    }

    private static AssetExpiryAlertDto? CreateAlert(
        Asset asset,
        string complianceType,
        DateTime expiryDate,
        DateTime today,
        int warningWindowDays)
    {
        var daysUntilExpiry = (expiryDate.Date - today).Days;
        var severity = daysUntilExpiry < 0
            ? Critical
            : daysUntilExpiry <= warningWindowDays
                ? Warning
                : null;

        if (severity is null)
            return null;

        return new AssetExpiryAlertDto
        {
            AssetId = asset.Id,
            AssetCode = asset.AssetCode,
            AssetName = asset.AssetName,
            RegisterNo = asset.RegisterNo,
            ComplianceType = complianceType,
            ExpiryDate = expiryDate.Date,
            DaysUntilExpiry = daysUntilExpiry,
            Severity = severity,
            NotificationKey = $"asset:{asset.Id}:compliance:{complianceType.ToLowerInvariant()}:{expiryDate:yyyyMMdd}"
        };
    }
}

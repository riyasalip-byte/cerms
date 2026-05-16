using CERMS.Application.Features.Assets.Compliance;
using CERMS.Domain.Entities;
using FluentAssertions;

namespace CERMS.Application.UnitTests.Features.Assets.Compliance;

public class AssetComplianceExpiryTests
{
    private static readonly Guid ExcavatorCategoryId = Guid.Parse("00000000-0000-0000-0000-000000000101");
    [Fact]
    public void Evaluate_ShouldReturnCriticalAlerts_WhenComplianceDatesAreExpired()
    {
        var today = new DateTime(2026, 5, 16);
        var asset = CreateAsset(
            fitnessExpiryDate: today.AddDays(-1),
            insuranceExpiryDate: today.AddDays(-10),
            puccExpiryDate: today.AddDays(90));

        var alerts = AssetComplianceExpiry.Evaluate(asset, today);

        alerts.Should().HaveCount(2);
        alerts.Should().OnlyContain(alert => alert.Severity == AssetComplianceExpiry.Critical);
        alerts.Select(alert => alert.ComplianceType).Should().BeEquivalentTo("Fitness", "Insurance");
    }

    [Fact]
    public void Evaluate_ShouldReturnWarningAlerts_WhenComplianceDatesExpireWithinWindow()
    {
        var today = new DateTime(2026, 5, 16);
        var asset = CreateAsset(
            fitnessExpiryDate: today.AddDays(30),
            insuranceExpiryDate: today.AddDays(31),
            puccExpiryDate: today.AddDays(7));

        var alerts = AssetComplianceExpiry.Evaluate(asset, today);

        alerts.Should().HaveCount(2);
        alerts.Should().OnlyContain(alert => alert.Severity == AssetComplianceExpiry.Warning);
        alerts.Select(alert => alert.ComplianceType).Should().BeEquivalentTo("Fitness", "PUCC");
        alerts.Should().Contain(alert => alert.DaysUntilExpiry == 30);
        alerts.Should().Contain(alert => alert.DaysUntilExpiry == 7);
    }

    [Fact]
    public void Evaluate_ShouldNotReturnAlerts_WhenComplianceDatesAreOutsideWindow()
    {
        var today = new DateTime(2026, 5, 16);
        var asset = CreateAsset(
            fitnessExpiryDate: today.AddDays(31),
            insuranceExpiryDate: today.AddDays(90),
            puccExpiryDate: today.AddDays(180));

        var alerts = AssetComplianceExpiry.Evaluate(asset, today);

        alerts.Should().BeEmpty();
    }

    private static Asset CreateAsset(
        DateTime fitnessExpiryDate,
        DateTime insuranceExpiryDate,
        DateTime puccExpiryDate) => new(
            "AST-0001",
            "Excavator EX-01",
            ExcavatorCategoryId,
            100,
            "KL-01-EX-001",
            fitnessExpiryDate,
            insuranceExpiryDate,
            puccExpiryDate);
}

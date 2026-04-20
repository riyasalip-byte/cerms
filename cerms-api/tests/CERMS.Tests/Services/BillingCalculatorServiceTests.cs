using CERMS.Application.Services;
using CERMS.Domain.Enums;
using Xunit;

namespace CERMS.Tests.Services;

public class BillingCalculatorServiceTests
{
    private readonly BillingCalculatorService _service;

    public BillingCalculatorServiceTests()
    {
        _service = new BillingCalculatorService();
    }

    [Fact]
    public void Calculate_Hourly_MinimumOneHour()
    {
        // Arrange
        var start = new DateTime(2026, 4, 1, 10, 0, 0);
        var end = start.AddMinutes(15); // 0.25 hrs
        var rate = 100m;

        // Act
        var result = _service.Calculate(start, end, rate, RateType.Hourly);

        // Assert
        Assert.Equal(1.0, result.Quantity);
        Assert.Equal(100m, result.TotalAmount);
    }

    [Fact]
    public void Calculate_Hourly_RoundUpToNearestHalf()
    {
        // Arrange
        var start = new DateTime(2026, 4, 1, 10, 0, 0);
        var end = start.AddMinutes(75); // 1.25 hrs -> should round to 1.5
        var rate = 100m;

        // Act
        var result = _service.Calculate(start, end, rate, RateType.Hourly);

        // Assert
        Assert.Equal(1.5, result.Quantity);
        Assert.Equal(150m, result.TotalAmount);
    }

    [Fact]
    public void Calculate_Daily_MinimumOneDay()
    {
        // Arrange
        var start = new DateTime(2026, 4, 1, 10, 0, 0);
        var end = start.AddHours(2);
        var rate = 500m;

        // Act
        var result = _service.Calculate(start, end, rate, RateType.Daily);

        // Assert
        Assert.Equal(1.0, result.Quantity);
        Assert.Equal(500m, result.TotalAmount);
    }

    [Fact]
    public void Calculate_Daily_MultiDay()
    {
        // Arrange
        var start = new DateTime(2026, 4, 1, 10, 0, 0);
        var end = start.AddHours(25); // 1.04 days -> should round to 2
        var rate = 500m;

        // Act
        var result = _service.Calculate(start, end, rate, RateType.Daily);

        // Assert
        Assert.Equal(2.0, result.Quantity);
        Assert.Equal(1000m, result.TotalAmount);
    }

    [Fact]
    public void Calculate_Weekly_MultiWeek()
    {
        // Arrange
        var start = new DateTime(2026, 4, 1, 10, 0, 0);
        var end = start.AddDays(8); // 1.14 weeks -> should round to 2
        var rate = 2000m;

        // Act
        var result = _service.Calculate(start, end, rate, RateType.Weekly);

        // Assert
        Assert.Equal(2.0, result.Quantity);
        Assert.Equal(4000m, result.TotalAmount);
    }

    [Fact]
    public void Calculate_Monthly_ProRated()
    {
        // Arrange
        var start = new DateTime(2026, 4, 1, 10, 0, 0);
        var end = start.AddDays(15);
        var rate = 6000m;
        // April has 30 days. 15/30 = 0.5.

        // Act
        var result = _service.Calculate(start, end, rate, RateType.Monthly);

        // Assert
        Assert.Equal(0.5, result.Quantity);
        Assert.Equal(3000m, result.TotalAmount);
    }

    [Fact]
    public void Calculate_ZeroDuration_ReturnsZero()
    {
        // Arrange
        var start = new DateTime(2026, 4, 1, 10, 0, 0);
        var end = start;
        var rate = 100m;

        // Act
        var result = _service.Calculate(start, end, rate, RateType.Hourly);

        // Assert
        Assert.Equal(0, result.Quantity);
        Assert.Equal(0m, result.TotalAmount);
    }
}

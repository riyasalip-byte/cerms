using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Enums;
using System.Globalization;

namespace CERMS.Application.Services;

public class BillingCalculatorService : IBillingCalculatorService
{
    public BillingResultDto Calculate(DateTime start, DateTime end, decimal rate, RateType rateType)
    {
        if (end <= start)
        {
            return new BillingResultDto
            {
                Quantity = 0,
                UnitRate = rate,
                TotalAmount = 0,
                BreakdownText = "Zero or negative duration."
            };
        }

        var duration = end - start;
        var totalHours = duration.TotalHours;

        return rateType switch
        {
            RateType.Hourly => CalculateHourly(totalHours, rate),
            RateType.Daily => CalculateDaily(totalHours, rate),
            RateType.Weekly => CalculateWeekly(duration.TotalDays, rate),
            RateType.Monthly => CalculateMonthly(start, end, rate),
            _ => throw new ArgumentOutOfRangeException(nameof(rateType), rateType, null)
        };
    }

    private BillingResultDto CalculateHourly(double hours, decimal rate)
    {
        // Minimum 1 hour, round up to nearest 0.5 hour
        var quantity = Math.Max(1.0, Math.Ceiling(hours * 2) / 2.0);
        var total = (decimal)quantity * rate;

        return new BillingResultDto
        {
            Quantity = quantity,
            UnitRate = rate,
            TotalAmount = total,
            BreakdownText = $"Hourly: {hours:F2} hrs rounded to {quantity:F1} hrs @ ${rate}/hr"
        };
    }

    private BillingResultDto CalculateDaily(double hours, decimal rate)
    {
        // Total days = ceil(hours / 24), minimum 1 day
        var quantity = Math.Max(1.0, Math.Ceiling(hours / 24.0));
        var total = (decimal)quantity * rate;

        return new BillingResultDto
        {
            Quantity = quantity,
            UnitRate = rate,
            TotalAmount = total,
            BreakdownText = $"Daily: {hours:F2} hrs rounded to {quantity} day(s) @ ${rate}/day"
        };
    }

    private BillingResultDto CalculateWeekly(double days, decimal rate)
    {
        // Total weeks = ceil(days / 7)
        var quantity = Math.Max(1.0, Math.Ceiling(days / 7.0));
        var total = (decimal)quantity * rate;

        return new BillingResultDto
        {
            Quantity = quantity,
            UnitRate = rate,
            TotalAmount = total,
            BreakdownText = $"Weekly: {days:F2} days rounded to {quantity} week(s) @ ${rate}/week"
        };
    }

    private BillingResultDto CalculateMonthly(DateTime start, DateTime end, decimal rate)
    {
        // Pro-rated: (days used / days in month) * monthly rate
        var daysInMonth = DateTime.DaysInMonth(start.Year, start.Month);
        var daysUsed = (end - start).TotalDays;
        
        var quantity = daysUsed / daysInMonth;
        var total = (decimal)quantity * rate;

        return new BillingResultDto
        {
            Quantity = quantity,
            UnitRate = rate,
            TotalAmount = total,
            BreakdownText = $"Monthly: {daysUsed:F2} days / {daysInMonth} days in month = {quantity:P2} of month @ ${rate}/month"
        };
    }
}

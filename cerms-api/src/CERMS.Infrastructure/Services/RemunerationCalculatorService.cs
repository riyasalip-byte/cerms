using CERMS.Application.Interfaces;

namespace CERMS.Infrastructure.Services;

public class RemunerationCalculatorService : IRemunerationCalculatorService
{
    public decimal CalculateGrossAmount(decimal monthlySalary, int workedDays, int totalDaysInMonth)
    {
        if (totalDaysInMonth == 0) return 0;
        
        // Simple pro-rata calculation
        return (monthlySalary / totalDaysInMonth) * workedDays;
    }
}

namespace CERMS.Application.Interfaces;

public interface IRemunerationCalculatorService
{
    decimal CalculateGrossAmount(decimal monthlySalary, int workedDays, int totalDaysInMonth);
}

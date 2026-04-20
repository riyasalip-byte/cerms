using CERMS.Application.DTOs;
using CERMS.Domain.Enums;

namespace CERMS.Application.Interfaces;

public interface IBillingCalculatorService
{
    BillingResultDto Calculate(DateTime start, DateTime end, decimal rate, RateType rateType);
}

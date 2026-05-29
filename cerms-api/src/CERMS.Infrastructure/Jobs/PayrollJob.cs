using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CERMS.Infrastructure.Jobs;

public class PayrollJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRemunerationCalculatorService _calculator;
    private readonly ILogger<PayrollJob> _logger;

    public PayrollJob(IUnitOfWork unitOfWork, IRemunerationCalculatorService calculator, ILogger<PayrollJob> logger)
    {
        _unitOfWork = unitOfWork;
        _calculator = calculator;
        _logger = logger;
    }

    public async Task ProcessMonthlyPayroll(DateTime executionDate)
    {
        var firstDayOfMonth = new DateTime(executionDate.Year, executionDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        _logger.LogInformation("Starting payroll processing for {Period}", firstDayOfMonth.ToString("MMMM yyyy"));

        // Idempotency check
        var alreadyProcessed = await _unitOfWork.Repository<RemunerationRecord>().Entities
            .AnyAsync(r => r.Period == firstDayOfMonth);

        if (alreadyProcessed)
        {
            _logger.LogWarning("Payroll for {Period} has already been processed. Skipping.", firstDayOfMonth.ToString("MMMM yyyy"));
            return;
        }

        var staffMembers = await _unitOfWork.Repository<StaffMember>().GetAllAsync();
        var daysInMonth = DateTime.DaysInMonth(executionDate.Year, executionDate.Month);

        foreach (var staff in staffMembers)
        {
            try
            {
                // In a real scenario, we would fetch attendance records here
                // For now, assume full attendance
                int workedDays = daysInMonth; 

                var grossAmount = _calculator.CalculateGrossAmount(staff.MonthlySalary, workedDays, daysInMonth);

                // Fetch pending advances
                var advances = await _unitOfWork.Repository<SalaryAdvance>().Entities
                    .Where(a => a.StaffMemberId == staff.Id && !a.IsDeducted)
                    .ToListAsync();

                var totalAdvances = advances.Sum(a => a.Amount);

                var record = new RemunerationRecord(staff.Id, firstDayOfMonth, grossAmount, totalAdvances);
                record.CompanyId = staff.CompanyId;
                record.BranchId = staff.BranchId;

                await _unitOfWork.Repository<RemunerationRecord>().AddAsync(record);

                // Mark advances as deducted
                foreach (var advance in advances)
                {
                    advance.MarkAsDeducted(record.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payroll for staff {StaffId}", staff.Id);
            }
        }

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Payroll processing completed for {Period}", firstDayOfMonth.ToString("MMMM yyyy"));
    }
}

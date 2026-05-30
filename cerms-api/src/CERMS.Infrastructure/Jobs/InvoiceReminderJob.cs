using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CERMS.Infrastructure.Jobs;

public class InvoiceReminderJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<InvoiceReminderJob> _logger;

    public InvoiceReminderJob(IUnitOfWork unitOfWork, ILogger<InvoiceReminderJob> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task SendOverdueReminders()
    {
        _logger.LogInformation("Starting daily overdue invoice reminder job...");

        var today = DateTime.UtcNow.Date;
        
        var overdueInvoices = await _unitOfWork.Repository<Invoice>().Entities
            .Where(i => i.Status != InvoiceStatus.Paid && i.DueDate < today && (i.Total - i.AmountPaid) > 0)
            .ToListAsync();

        _logger.LogInformation("Found {Count} overdue invoices", overdueInvoices.Count);

        foreach (var invoice in overdueInvoices)
        {
            try
            {
                // Logic to find customer email via Booking -> Customer
                // For now, just log the reminder
                _logger.LogWarning(
                    "REMINDER: Invoice {InvoiceNumber} is OVERDUE. Due Date: {DueDate:yyyy-MM-dd}, Balance: ${BalanceDue}",
                    invoice.InvoiceNumber,
                    invoice.DueDate,
                    invoice.BalanceDue
                );

                // Mock email sending:
                // await _emailService.SendAsync(customerEmail, "Overdue Payment Reminder", ...);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing reminder for invoice {InvoiceId}", invoice.Id);
            }
        }

        _logger.LogInformation("Daily overdue reminder job completed.");
    }
}

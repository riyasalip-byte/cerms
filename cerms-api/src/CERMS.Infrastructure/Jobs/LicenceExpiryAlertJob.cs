using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CERMS.Infrastructure.Jobs;

public class LicenceExpiryAlertJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<LicenceExpiryAlertJob> _logger;

    public LicenceExpiryAlertJob(IUnitOfWork unitOfWork, ILogger<LicenceExpiryAlertJob> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task CheckLicenceExpiries()
    {
        _logger.LogInformation("Checking for upcoming staff licence expiries...");

        var today = DateTime.UtcNow.Date;
        var thresholdDate = today.AddDays(60);

        var expiringLicences = await _unitOfWork.Repository<StaffMember>().Entities
            .Where(s => s.LicenceExpiryDate != null && s.LicenceExpiryDate <= thresholdDate && s.LicenceExpiryDate >= today)
            .ToListAsync();

        _logger.LogInformation("Found {Count} staff members with licences expiring in the next 60 days", expiringLicences.Count);

        foreach (var staff in expiringLicences)
        {
            try
            {
                var daysRemaining = (staff.LicenceExpiryDate.Value.Date - today).Days;

                _logger.LogWarning(
                    "LICENCE EXPIRY ALERT: {FirstName} {LastName} (Code: {EmployeeCode}). Licence: {LicenceNumber} expires on {ExpiryDate:yyyy-MM-dd} ({Days} days remaining).",
                    staff.FirstName,
                    staff.LastName,
                    staff.EmployeeCode,
                    staff.LicenceNumber ?? "N/A",
                    staff.LicenceExpiryDate,
                    daysRemaining
                );

                // Future: Send push notification or email
                // await _notificationService.SendAsync(staff.UserId, "Licence Expiry Alert", ...);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing licence alert for staff {StaffId}", staff.Id);
            }
        }

        _logger.LogInformation("Licence expiry check completed.");
    }
}

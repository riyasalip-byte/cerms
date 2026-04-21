using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CERMS.Infrastructure.Persistence;

public class CermsDbContextInitialiser
{
    private readonly ILogger<CermsDbContextInitialiser> _logger;
    private readonly CermsDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public CermsDbContextInitialiser(ILogger<CermsDbContextInitialiser> logger, CermsDbContext context, IPasswordHasher passwordHasher)
    {
        _logger = logger;
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            if (_context.Database.IsNpgsql())
            {
                await _context.Database.MigrateAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        // Default Company and Branch
        var companyId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var branchId = Guid.Parse("00000000-0000-0000-0000-000000000001");

        // Default User
        var adminEmail = "admin@cerms.com";
        if (!await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == adminEmail))
        {
            var adminUser = new User(
                "admin",
                adminEmail,
                _passwordHasher.HashPassword("Admin@123"),
                UserRole.Admin,
                companyId,
                branchId
            );

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded default admin user: {Email}", adminEmail);
        }
    }
}

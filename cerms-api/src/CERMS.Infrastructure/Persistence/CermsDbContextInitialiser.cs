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
                await EnsureRentalRateColumnsAreNullableAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    private async Task EnsureRentalRateColumnsAreNullableAsync()
    {
        await _context.Database.ExecuteSqlRawAsync(
            "ALTER TABLE rental_bookings ALTER COLUMN rate_type DROP NOT NULL;");
        await _context.Database.ExecuteSqlRawAsync(
            "ALTER TABLE rental_bookings ALTER COLUMN rate_amount DROP NOT NULL;");
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

        // Seed Assets if none exist
        if (!await _context.Assets.IgnoreQueryFilters().AnyAsync())
        {
            var purchaseDate = DateTime.UtcNow.AddYears(-1);
            var assets = new List<Asset>
            {
                new Asset("AST-0001", "Caterpillar Excavator 320", AssetCategory.Excavator, 1250m, "KL-01-EX-320", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 10000m) { CompanyId = companyId, BranchId = branchId },
                new Asset("AST-0002", "Mini Excavator 35", AssetCategory.MiniExcavator, 450m, "KL-01-ME-035", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 5000m) { CompanyId = companyId, BranchId = branchId },
                new Asset("AST-0003", "Backhoe Loader 3DX", AssetCategory.BackhoeLoader, 890m, "KL-01-BL-3DX", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 5000m) { CompanyId = companyId, BranchId = branchId },
                new Asset("AST-0004", "Light Medium Duty Tipper", AssetCategory.LightMediumDutyTipper, 210m, "KL-01-LT-010", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 10000m) { CompanyId = companyId, BranchId = branchId },
                new Asset("AST-0005", "Heavy Duty Tipper", AssetCategory.HeavyDutyTipper, 155m, "KL-01-HT-012", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 5000m) { CompanyId = companyId, BranchId = branchId }
            };

            _context.Assets.AddRange(assets);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} assets.", assets.Count);
        }
    }
}

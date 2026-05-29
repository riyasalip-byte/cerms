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

        // Seed Asset Categories
        Guid excavatorCatId = Guid.Parse("00000000-0000-0000-0000-000000000101");
        Guid miniExcavatorCatId = Guid.Parse("00000000-0000-0000-0000-000000000102");
        Guid backhoeLoaderCatId = Guid.Parse("00000000-0000-0000-0000-000000000103");
        Guid lightTipperCatId = Guid.Parse("00000000-0000-0000-0000-000000000104");
        Guid heavyTipperCatId = Guid.Parse("00000000-0000-0000-0000-000000000105");

        var defaultCategories = new List<AssetCategory>
        {
            new AssetCategory(excavatorCatId, "Excavator", null, true) { CompanyId = companyId, BranchId = branchId },
            new AssetCategory(miniExcavatorCatId, "Mini Excavator", null, true) { CompanyId = companyId, BranchId = branchId },
            new AssetCategory(backhoeLoaderCatId, "Backhoe Loader", null, true) { CompanyId = companyId, BranchId = branchId },
            new AssetCategory(lightTipperCatId, "Light/Medium Duty Tipper", null, false) { CompanyId = companyId, BranchId = branchId },
            new AssetCategory(heavyTipperCatId, "Heavy Duty Tipper", null, false) { CompanyId = companyId, BranchId = branchId }
        };

        var existingCategories = await _context.AssetCategories.IgnoreQueryFilters().ToListAsync();
        var existingCategoryNames = existingCategories
            .Select(c => c.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missingCategories = defaultCategories
            .Where(c => !existingCategoryNames.Contains(c.Name))
            .ToList();

        if (missingCategories.Count > 0)
        {
            _context.AssetCategories.AddRange(missingCategories);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} missing asset categories.", missingCategories.Count);

            existingCategories.AddRange(missingCategories);
        }

        excavatorCatId = existingCategories.FirstOrDefault(c => c.Name == "Excavator")?.Id ?? excavatorCatId;
        miniExcavatorCatId = existingCategories.FirstOrDefault(c => c.Name == "Mini Excavator")?.Id ?? miniExcavatorCatId;
        backhoeLoaderCatId = existingCategories.FirstOrDefault(c => c.Name == "Backhoe Loader")?.Id ?? backhoeLoaderCatId;
        lightTipperCatId = existingCategories.FirstOrDefault(c => c.Name == "Light/Medium Duty Tipper")?.Id ?? lightTipperCatId;
        heavyTipperCatId = existingCategories.FirstOrDefault(c => c.Name == "Heavy Duty Tipper")?.Id ?? heavyTipperCatId;

        var defaultMaintenanceTypes = new List<MaintenanceType>
        {
            new(Guid.Parse("00000000-0000-0000-0000-000000000201"), "Preventive Maintenance", "Scheduled preventive maintenance.", true) { CompanyId = companyId, BranchId = branchId },
            new(Guid.Parse("00000000-0000-0000-0000-000000000202"), "Breakdown Maintenance", "Unplanned maintenance after failure.", false) { CompanyId = companyId, BranchId = branchId },
            new(Guid.Parse("00000000-0000-0000-0000-000000000203"), "Periodic Service", "Routine periodic service.", true) { CompanyId = companyId, BranchId = branchId },
            new(Guid.Parse("00000000-0000-0000-0000-000000000204"), "Major Repair", "Major repair work.", false) { CompanyId = companyId, BranchId = branchId },
            new(Guid.Parse("00000000-0000-0000-0000-000000000205"), "Tyre Replacement", "Tyre replacement or repair.", false) { CompanyId = companyId, BranchId = branchId },
            new(Guid.Parse("00000000-0000-0000-0000-000000000206"), "Hydraulic Work", "Hydraulic system work.", false) { CompanyId = companyId, BranchId = branchId },
            new(Guid.Parse("00000000-0000-0000-0000-000000000207"), "Electrical Work", "Electrical system work.", false) { CompanyId = companyId, BranchId = branchId },
            new(Guid.Parse("00000000-0000-0000-0000-000000000208"), "Engine Work", "Engine diagnostics or repair.", false) { CompanyId = companyId, BranchId = branchId },
            new(Guid.Parse("00000000-0000-0000-0000-000000000209"), "Accident Repair", "Accident repair work.", false) { CompanyId = companyId, BranchId = branchId },
            new(Guid.Parse("00000000-0000-0000-0000-000000000210"), "Other", "Other maintenance activity.", false) { CompanyId = companyId, BranchId = branchId }
        };

        var existingMaintenanceTypes = await _context.MaintenanceTypes.IgnoreQueryFilters().ToListAsync();
        var existingMaintenanceTypeNames = existingMaintenanceTypes
            .Select(t => t.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missingMaintenanceTypes = defaultMaintenanceTypes
            .Where(t => !existingMaintenanceTypeNames.Contains(t.Name))
            .ToList();

        if (missingMaintenanceTypes.Count > 0)
        {
            _context.MaintenanceTypes.AddRange(missingMaintenanceTypes);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} missing maintenance types.", missingMaintenanceTypes.Count);
        }

        // Seed Assets if none exist
        if (!await _context.Assets.IgnoreQueryFilters().AnyAsync())
        {
            var purchaseDate = DateTime.UtcNow.AddYears(-1);
            var assets = new List<Asset>
            {
                new Asset("AST-0001", "Caterpillar Excavator 320", excavatorCatId, 1250m, "KL-01-EX-320", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 10000m) { CompanyId = companyId, BranchId = branchId },
                new Asset("AST-0002", "Mini Excavator 35", miniExcavatorCatId, 450m, "KL-01-ME-035", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 5000m) { CompanyId = companyId, BranchId = branchId },
                new Asset("AST-0003", "Backhoe Loader 3DX", backhoeLoaderCatId, 890m, "KL-01-BL-3DX", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 5000m) { CompanyId = companyId, BranchId = branchId },
                new Asset("AST-0004", "Light Medium Duty Tipper", lightTipperCatId, 210m, "KL-01-LT-010", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 10000m) { CompanyId = companyId, BranchId = branchId },
                new Asset("AST-0005", "Heavy Duty Tipper", heavyTipperCatId, 155m, "KL-01-HT-012", purchaseDate.AddYears(1), purchaseDate.AddYears(1), purchaseDate.AddMonths(6), purchaseDate, serviceIntervalKm: 5000m) { CompanyId = companyId, BranchId = branchId }
            };

            _context.Assets.AddRange(assets);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} assets.", assets.Count);
        }

        // Seed Operator if none exist
        var operatorEmail = "operator@cerms.com";
        if (!await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == operatorEmail))
        {
            var opUser = new User(
                "operator",
                operatorEmail,
                _passwordHasher.HashPassword("Operator@123"),
                UserRole.Operator,
                companyId,
                branchId
            );

            _context.Users.Add(opUser);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded default operator user: {Email}", operatorEmail);

            var testOperator = new Operator(
                "OP-0001",
                "Alex Operator",
                "9876543210",
                "LIC-998811",
                DateTime.UtcNow.AddYears(3),
                DateTime.UtcNow.AddMonths(-6),
                150.00m,
                alternateMobileNo: "9876543211",
                address: "Operator Street 10, City B",
                userId: opUser.Id
            ) { CompanyId = companyId, BranchId = branchId };

            _context.Operators.Add(testOperator);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded default operator profile linked to user: {Code}", testOperator.OperatorCode);
        }
    }
}

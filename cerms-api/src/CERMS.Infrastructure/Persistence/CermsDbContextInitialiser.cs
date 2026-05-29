using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        // 1. Seed Roles
        var defaultRoles = new List<Role>
        {
            new Role("Admin", "Full administrative permissions", true) { CompanyId = companyId, BranchId = branchId },
            new Role("OfficeStaff", "Rental desk and coordination staff", true) { CompanyId = companyId, BranchId = branchId },
            new Role("Operator", "Equipment machine operator", true) { CompanyId = companyId, BranchId = branchId },
            new Role("Accounts", "Billing and invoice management", true) { CompanyId = companyId, BranchId = branchId },
            new Role("Manager", "Management reviews and reports", true) { CompanyId = companyId, BranchId = branchId }
        };

        var existingRoles = await _context.Roles.IgnoreQueryFilters().ToListAsync();
        var existingRoleNames = existingRoles.Select(r => r.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missingRoles = defaultRoles.Where(r => !existingRoleNames.Contains(r.Name)).ToList();
        if (missingRoles.Count > 0)
        {
            _context.Roles.AddRange(missingRoles);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} system roles.", missingRoles.Count);
            existingRoles.AddRange(missingRoles);
        }

        var adminRole = existingRoles.First(r => r.Name == "Admin");
        var operatorRole = existingRoles.First(r => r.Name == "Operator");

        // 2. Seed Asset Classes
        var defaultAssetClasses = new List<AssetClass>
        {
            new AssetClass("Excavator", "Tracked heavy excavator") { CompanyId = companyId, BranchId = branchId },
            new AssetClass("Mini Excavator", "Compact excavator") { CompanyId = companyId, BranchId = branchId },
            new AssetClass("Backhoe Loader", "Utility loader backhoe") { CompanyId = companyId, BranchId = branchId },
            new AssetClass("Tipper", "Dumper tipper truck") { CompanyId = companyId, BranchId = branchId },
            new AssetClass("Crane", "Mobile crane") { CompanyId = companyId, BranchId = branchId },
            new AssetClass("Roller", "Soil compactor roller") { CompanyId = companyId, BranchId = branchId },
            new AssetClass("Other", "General plant machinery") { CompanyId = companyId, BranchId = branchId }
        };

        var existingAssetClasses = await _context.AssetClasses.IgnoreQueryFilters().ToListAsync();
        var existingAssetClassNames = existingAssetClasses.Select(ac => ac.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missingAssetClasses = defaultAssetClasses.Where(ac => !existingAssetClassNames.Contains(ac.Name)).ToList();
        if (missingAssetClasses.Count > 0)
        {
            _context.AssetClasses.AddRange(missingAssetClasses);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} asset classes.", missingAssetClasses.Count);
            existingAssetClasses.AddRange(missingAssetClasses);
        }

        // 3. Seed default HR Staff profiles
        var adminStaffCode = "STF-0001";
        var adminStaff = await _context.Staffs.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.StaffCode == adminStaffCode || s.Email == "admin@cerms.com");
        if (adminStaff == null)
        {
            adminStaff = new Staff(
                adminStaffCode, "John", "Admin", "John Admin", "Male", new DateTime(1985, 5, 20, 0, 0, 0, DateTimeKind.Utc),
                "9998887776", "admin@cerms.com", "Main Business Office Suite 1", "Tech City", "State A", "600001",
                "Jane Admin", "9998887775", EmployeeCategory.Other, DateTime.UtcNow.AddYears(-2), "System Administrator", "IT & Management"
            ) { CompanyId = companyId, BranchId = branchId };
            _context.Staffs.Add(adminStaff);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded Admin Staff: {Code}", adminStaff.StaffCode);
        }

        var operatorStaffCode = "STF-0002";
        var operatorStaff = await _context.Staffs.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.StaffCode == operatorStaffCode || s.Email == "operator@cerms.com");
        if (operatorStaff == null)
        {
            operatorStaff = new Staff(
                operatorStaffCode, "Alex", "Operator", "Alex Operator", "Male", new DateTime(1990, 8, 12, 0, 0, 0, DateTimeKind.Utc),
                "9876543210", "operator@cerms.com", "Operator Road 10", "City B", "State A", "600002",
                "Anne Operator", "9876543211", EmployeeCategory.Operator, DateTime.UtcNow.AddMonths(-6), "Senior Machine Operator", "Operations"
            ) { CompanyId = companyId, BranchId = branchId };
            operatorStaff.ConfigureOperatorDetails("LIC-998811", "Heavy Machinery Permitted", DateTime.UtcNow.AddYears(3), 6, "A+ Grade");
            operatorStaff.UpdateFinancialsAndIdentity(150.00m, 3500.00m, "123456789012", "ABCDE1234F", "Seeded Operator Account");
            
            _context.Staffs.Add(operatorStaff);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded Operator Staff: {Code}", operatorStaff.StaffCode);
        }

        // 4. Seed default Users
        var adminEmail = "admin@cerms.com";
        var adminUser = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (adminUser == null)
        {
            adminUser = new User(
                "admin",
                adminEmail,
                _passwordHasher.HashPassword("Admin@123"),
                adminStaff.Id,
                adminRole.Id,
                companyId,
                branchId
            );

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded default admin user: {Email}", adminEmail);

            adminStaff.UserId = adminUser.Id;
            _context.Staffs.Update(adminStaff);
            await _context.SaveChangesAsync();
        }

        var operatorEmail = "operator@cerms.com";
        var opUser = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == operatorEmail);
        if (opUser == null)
        {
            opUser = new User(
                "operator",
                operatorEmail,
                _passwordHasher.HashPassword("Operator@123"),
                operatorStaff.Id,
                operatorRole.Id,
                companyId,
                branchId
            );

            _context.Users.Add(opUser);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded default operator user: {Email}", operatorEmail);

            operatorStaff.UserId = opUser.Id;
            _context.Staffs.Update(operatorStaff);
            await _context.SaveChangesAsync();
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
    }
}

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

        // 1b. Seed Permissions
        var defaultPermissions = new List<Permission>
        {
            // Asset Module
            new Permission("Asset", "Asset.View", "View Assets", "Allows viewing assets list and details"),
            new Permission("Asset", "Asset.Create", "Create Asset", "Allows creating new assets"),
            new Permission("Asset", "Asset.Edit", "Edit Asset", "Allows editing existing assets"),
            new Permission("Asset", "Asset.Delete", "Delete Asset", "Allows deleting assets"),

            // Customer Module
            new Permission("Customer", "Customer.View", "View Customers", "Allows viewing customers list and details"),
            new Permission("Customer", "Customer.Create", "Create Customer", "Allows creating new customers"),
            new Permission("Customer", "Customer.Edit", "Edit Customer", "Allows editing existing customers"),
            new Permission("Customer", "Customer.Delete", "Delete Customer", "Allows deleting customers"),

            // Rental Module
            new Permission("Rental", "Rental.View", "View Rentals", "Allows viewing rental bookings list and details"),
            new Permission("Rental", "Rental.Create", "Create Rental", "Allows creating new rental bookings"),
            new Permission("Rental", "Rental.Edit", "Edit Rental", "Allows editing existing rental bookings"),
            new Permission("Rental", "Rental.Close", "Close Rental", "Allows closing or completing rental bookings"),
            new Permission("Rental", "Rental.Start", "Start Rental", "Allows starting dispatch operations"),
            new Permission("Rental", "Rental.Complete", "Complete Rental", "Allows completing operator dispatch tasks"),

            // Maintenance Module
            new Permission("Maintenance", "Maintenance.View", "View Maintenance", "Allows viewing maintenance records"),
            new Permission("Maintenance", "Maintenance.Create", "Create Maintenance", "Allows creating new maintenance records"),
            new Permission("Maintenance", "Maintenance.Edit", "Edit Maintenance", "Allows editing existing maintenance records"),
            new Permission("Maintenance", "Maintenance.Close", "Close Maintenance", "Allows closing maintenance records"),

            // Fuel Module
            new Permission("Fuel", "Fuel.View", "View Fuel Entries", "Allows viewing fuel entries"),
            new Permission("Fuel", "Fuel.Create", "Create Fuel Entry", "Allows creating new fuel entries"),
            new Permission("Fuel", "Fuel.Edit", "Edit Fuel Entry", "Allows editing existing fuel entries"),

            // Invoice Module
            new Permission("Invoice", "Invoice.View", "View Invoices", "Allows viewing invoices"),
            new Permission("Invoice", "Invoice.Create", "Create Invoice", "Allows creating new invoices"),
            new Permission("Invoice", "Invoice.Approve", "Approve Invoice", "Allows approving draft invoices"),

            // Reports Module
            new Permission("Reports", "Reports.View", "View Reports", "Allows viewing financial and operational reports"),

            // Staff Module
            new Permission("Staff", "Staff.View", "View Staff", "Allows viewing staff members"),
            new Permission("Staff", "Staff.Create", "Create Staff", "Allows creating new staff members"),
            new Permission("Staff", "Staff.Edit", "Edit Staff", "Allows editing existing staff members"),

            // Users Module
            new Permission("Users", "Users.View", "View Users", "Allows viewing user accounts"),
            new Permission("Users", "Users.Create", "Create User", "Allows creating new user accounts"),
            new Permission("Users", "Users.Edit", "Edit User", "Allows editing existing user accounts"),
            new Permission("Users", "Users.ResetPassword", "Reset Password", "Allows resetting user passwords"),

            // Roles Module
            new Permission("Roles", "Roles.View", "View Roles", "Allows viewing role mappings"),
            new Permission("Roles", "Roles.Create", "Create Role", "Allows creating new security roles"),
            new Permission("Roles", "Roles.Edit", "Edit Role", "Allows editing existing security roles"),

            // Dashboard Module
            new Permission("Dashboard", "Dashboard.View", "View Dashboard", "Allows viewing system overview dashboard")
        };

        var existingPerms = await _context.Permissions.IgnoreQueryFilters().ToListAsync();
        var existingCodes = existingPerms.Select(p => p.PermissionCode).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missingPerms = defaultPermissions.Where(p => !existingCodes.Contains(p.PermissionCode)).ToList();
        if (missingPerms.Count > 0)
        {
            foreach (var p in missingPerms)
            {
                p.CompanyId = companyId;
                p.BranchId = branchId;
            }
            _context.Permissions.AddRange(missingPerms);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} new permissions.", missingPerms.Count);
            existingPerms.AddRange(missingPerms);
        }

        // 1c. Mapped Roles permissions
        // Admin mappings: Assign ALL permissions
        var adminRolePerms = await _context.RolePermissions.IgnoreQueryFilters().Where(rp => rp.RoleId == adminRole.Id).ToListAsync();
        if (adminRolePerms.Count != existingPerms.Count)
        {
            _context.RolePermissions.RemoveRange(adminRolePerms);
            await _context.SaveChangesAsync();

            var newAdminMappings = existingPerms.Select(p => new RolePermission(adminRole.Id, p.Id)).ToList();
            _context.RolePermissions.AddRange(newAdminMappings);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully mapped all {Count} permissions to Admin role.", existingPerms.Count);
        }

        // Operator mappings: Assign dynamic Operator permissions
        var operatorAllowedCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Dashboard.View",
            "Rental.View",
            "Rental.Start",
            "Rental.Complete",
            "Invoice.Create"
        };
        var operatorPerms = existingPerms.Where(p => operatorAllowedCodes.Contains(p.PermissionCode)).ToList();
        var operatorRolePerms = await _context.RolePermissions.IgnoreQueryFilters().Where(rp => rp.RoleId == operatorRole.Id).ToListAsync();

        if (operatorRolePerms.Count != operatorPerms.Count)
        {
            _context.RolePermissions.RemoveRange(operatorRolePerms);
            await _context.SaveChangesAsync();

            var newOpMappings = operatorPerms.Select(p => new RolePermission(operatorRole.Id, p.Id)).ToList();
            _context.RolePermissions.AddRange(newOpMappings);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully mapped specific permissions to Operator role.");
        }

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
        else
        {
            // Self-heal: ensure existing admin user is mapped to Admin role
            var hasCorrectAdminRole = await _context.UserRoles.IgnoreQueryFilters().AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id && !ur.IsDeleted);
            if (!hasCorrectAdminRole)
            {
                var existingUserRoles = await _context.UserRoles.IgnoreQueryFilters().Where(ur => ur.UserId == adminUser.Id).ToListAsync();
                if (existingUserRoles.Any())
                {
                    _context.UserRoles.RemoveRange(existingUserRoles);
                    await _context.SaveChangesAsync();
                }
                var adminUserRole = new CERMS.Domain.Entities.UserRole(adminUser.Id, adminRole.Id) { CompanyId = companyId, BranchId = branchId };
                _context.UserRoles.Add(adminUserRole);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Self-healed: Restored missing or incorrect UserRole mapping for Admin user.");
            }
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
        else
        {
            // Self-heal: ensure existing operator user is mapped to Operator role
            var hasCorrectOpRole = await _context.UserRoles.IgnoreQueryFilters().AnyAsync(ur => ur.UserId == opUser.Id && ur.RoleId == operatorRole.Id && !ur.IsDeleted);
            if (!hasCorrectOpRole)
            {
                var existingUserRoles = await _context.UserRoles.IgnoreQueryFilters().Where(ur => ur.UserId == opUser.Id).ToListAsync();
                if (existingUserRoles.Any())
                {
                    _context.UserRoles.RemoveRange(existingUserRoles);
                    await _context.SaveChangesAsync();
                }
                var operatorUserRole = new CERMS.Domain.Entities.UserRole(opUser.Id, operatorRole.Id) { CompanyId = companyId, BranchId = branchId };
                _context.UserRoles.Add(operatorUserRole);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Self-healed: Restored missing or incorrect UserRole mapping for Operator user.");
            }
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

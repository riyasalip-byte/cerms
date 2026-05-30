using CERMS.Application.Interfaces;
using CERMS.Domain.Common;
using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Reflection;

namespace CERMS.Infrastructure.Persistence;

public class CermsDbContext : DbContext
{
    private readonly ICurrentTenantService _currentTenantService;

    public CermsDbContext(DbContextOptions<CermsDbContext> options, ICurrentTenantService currentTenantService) : base(options)
    {
        _currentTenantService = currentTenantService;
    }

    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<User> Users => Set<User>();
    public DbSet<StaffMember> StaffMembers => Set<StaffMember>();
    public DbSet<RentalBooking> RentalBookings => Set<RentalBooking>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<RemunerationRecord> RemunerationRecords => Set<RemunerationRecord>();
    public DbSet<SalaryAdvance> SalaryAdvances => Set<SalaryAdvance>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();
    public DbSet<AssetCategory> AssetCategories => Set<AssetCategory>();
    public DbSet<MaintenanceType> MaintenanceTypes => Set<MaintenanceType>();
    public DbSet<FuelEntry> FuelEntries => Set<FuelEntry>();
    public DbSet<Operator> Operators => Set<Operator>();
    public DbSet<RentalAssignment> RentalAssignments => Set<RentalAssignment>();
    public DbSet<Staff> Staffs => Set<Staff>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<AssetClass> AssetClasses => Set<AssetClass>();
    public DbSet<StaffAssetClass> StaffAssetClasses => Set<StaffAssetClass>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(
                    CreateTenantAndDeletedFilter(entityType.ClrType));
            }
        }

        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc),
            v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => !v.HasValue ? v : (v.Value.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)),
            v => !v.HasValue ? v : (v.Value.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)));

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(nullableDateTimeConverter);
                }
            }
        }

        base.OnModelCreating(modelBuilder);
    }

    private System.Linq.Expressions.LambdaExpression CreateTenantAndDeletedFilter(Type type)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(type, "e");

        // !e.IsDeleted
        var isDeletedProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
        var isNotDeleted = System.Linq.Expressions.Expression.Not(isDeletedProperty);

        // e.CompanyId == _currentTenantService.CompanyId
        var companyIdProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.CompanyId));
        
        // This is the tricky part: referencing the DbContext instance property
        // We use a constant of the current DbContext to get the reference to _currentTenantService
        var tenantServiceExpression = System.Linq.Expressions.Expression.Field(
            System.Linq.Expressions.Expression.Constant(this), 
            nameof(_currentTenantService));
            
        var currentCompanyIdProperty = System.Linq.Expressions.Expression.Property(
            tenantServiceExpression, 
            nameof(ICurrentTenantService.CompanyId));
            
        var companyIdFilter = System.Linq.Expressions.Expression.Equal(
            System.Linq.Expressions.Expression.Convert(companyIdProperty, typeof(Guid?)), 
            currentCompanyIdProperty);

        var combinedFilter = System.Linq.Expressions.Expression.AndAlso(isNotDeleted, companyIdFilter);

        return System.Linq.Expressions.Expression.Lambda(combinedFilter, parameter);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSnakeCaseNamingConvention();
        base.OnConfiguring(optionsBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var auditEntries = new List<AuditLog>();
        
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog) continue;

            if (entry.State == EntityState.Added || entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
            {
                var entityType = entry.Entity.GetType().Name;
                if (entityType == "Role" || entityType == "RolePermission" || entityType == "UserRole")
                {
                    string action = entry.State.ToString() + entityType;
                    string tableName = entityType + "s";
                    
                    string primaryKey = "";
                    if (entry.Entity is BaseEntity baseEntity)
                    {
                        primaryKey = baseEntity.Id.ToString();
                    }
                    else if (entry.Entity is RolePermission rp)
                    {
                        primaryKey = $"Role:{rp.RoleId}-Perm:{rp.PermissionId}";
                    }
                    else if (entry.Entity is UserRole ur)
                    {
                        primaryKey = $"User:{ur.UserId}-Role:{ur.RoleId}";
                    }

                    string changedBy = "System";

                    string? oldValues = null;
                    string? newValues = null;

                    if (entry.State == EntityState.Modified)
                    {
                        var oldDict = new Dictionary<string, object>();
                        var newDict = new Dictionary<string, object>();

                        foreach (var prop in entry.OriginalValues.Properties)
                        {
                            var originalValue = entry.OriginalValues[prop];
                            var currentValue = entry.CurrentValues[prop];

                            if (originalValue?.ToString() != currentValue?.ToString())
                            {
                                oldDict[prop.Name] = originalValue;
                                newDict[prop.Name] = currentValue;
                            }
                        }

                        if (oldDict.Count > 0)
                        {
                            oldValues = System.Text.Json.JsonSerializer.Serialize(oldDict);
                            newValues = System.Text.Json.JsonSerializer.Serialize(newDict);
                        }
                    }
                    else if (entry.State == EntityState.Added)
                    {
                        var newDict = new Dictionary<string, object>();
                        foreach (var prop in entry.CurrentValues.Properties)
                        {
                            newDict[prop.Name] = entry.CurrentValues[prop];
                        }
                        newValues = System.Text.Json.JsonSerializer.Serialize(newDict);
                    }
                    else if (entry.State == EntityState.Deleted)
                    {
                        var oldDict = new Dictionary<string, object>();
                        foreach (var prop in entry.OriginalValues.Properties)
                        {
                            oldDict[prop.Name] = entry.OriginalValues[prop];
                        }
                        oldValues = System.Text.Json.JsonSerializer.Serialize(oldDict);
                    }

                    if (newValues != null || oldValues != null)
                    {
                        var audit = new AuditLog(action, tableName, primaryKey, changedBy, oldValues, newValues);
                        audit.CompanyId = _currentTenantService.CompanyId ?? Guid.Empty;
                        audit.BranchId = _currentTenantService.BranchId ?? Guid.Empty;
                        auditEntries.Add(audit);
                    }
                }
            }
        }

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    if (entry.Entity.CompanyId == Guid.Empty)
                        entry.Entity.CompanyId = _currentTenantService.CompanyId ?? Guid.Empty;
                    if (entry.Entity.BranchId == Guid.Empty)
                        entry.Entity.BranchId = _currentTenantService.BranchId ?? Guid.Empty;
                    break;
                case EntityState.Modified:
                    entry.Entity.Update();
                    break;
            }
        }

        if (auditEntries.Count > 0)
        {
            await AuditLogs.AddRangeAsync(auditEntries, cancellationToken);
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}

using CERMS.Application.Interfaces;
using CERMS.Domain.Common;
using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
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

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
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

        return base.SaveChangesAsync(cancellationToken);
    }
}

using CERMS.Application.Interfaces;
using CERMS.Infrastructure.MultiTenancy;
using CERMS.Infrastructure.Persistence;
using CERMS.Infrastructure.Repositories;
using CERMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CERMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddScoped<ICurrentTenantService, CurrentTenantService>();

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IAssetRepository, AssetRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IInvoicePdfService, InvoicePdfService>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IRemunerationCalculatorService, RemunerationCalculatorService>();
        services.AddScoped<CERMS.Infrastructure.Jobs.PayrollJob>();
        services.AddScoped<CERMS.Infrastructure.Jobs.InvoiceReminderJob>();
        services.AddScoped<CERMS.Infrastructure.Jobs.LicenceExpiryAlertJob>();
        services.AddScoped<CermsDbContextInitialiser>();
        services.AddHttpContextAccessor();

        services.AddDbContext<CermsDbContext>(options =>
            options.UseNpgsql(connectionString,
                builder => builder.MigrationsAssembly(typeof(CermsDbContext).Assembly.FullName)));

        // Register Dynamic Permission-Based Authorization Services
        services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationPolicyProvider, CERMS.Infrastructure.Security.PermissionPolicyProvider>();
        services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, CERMS.Infrastructure.Security.PermissionAuthorizationHandler>();

        return services;
    }
}

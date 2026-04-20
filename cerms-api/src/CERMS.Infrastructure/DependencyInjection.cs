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

        services.AddDbContext<CermsDbContext>(options =>
            options.UseNpgsql(connectionString,
                builder => builder.MigrationsAssembly(typeof(CermsDbContext).Assembly.FullName)));

        return services;
    }
}

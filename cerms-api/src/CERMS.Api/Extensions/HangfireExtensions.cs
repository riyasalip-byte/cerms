using Hangfire;
using Hangfire.PostgreSql;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Authorization;

namespace CERMS.Api.Extensions;

public static class HangfireExtensions
{
    public static IServiceCollection AddHangfireConfig(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options => options.UseNpgsqlConnection(configuration.GetConnectionString("DefaultConnection"))));

        services.AddHangfireServer();

        return services;
    }

    public static IApplicationBuilder UseHangfire(this IApplicationBuilder app)
    {
        app.UseHangfireDashboard("/hangfire", new DashboardOptions
        {
            Authorization = new[] { new HangfireAuthorizationFilter() },
            DashboardTitle = "CERMS Jobs"
        });

        return app;
    }
}

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // For demo/development purposes, allow local access or check for Admin role
        // In a real app, you'd check: httpContext.User.IsInRole("Admin")
        
        return httpContext.User.Identity?.IsAuthenticated == true;
    }
}

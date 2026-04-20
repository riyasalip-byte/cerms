using CERMS.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace CERMS.Infrastructure.MultiTenancy;

public class CurrentTenantService : ICurrentTenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? CompanyId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("company_id")?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    public Guid? BranchId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("branch_id")?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}

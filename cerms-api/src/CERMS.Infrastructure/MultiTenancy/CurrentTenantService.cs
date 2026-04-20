using CERMS.Application.Interfaces;

namespace CERMS.Infrastructure.MultiTenancy;

public class CurrentTenantService : ICurrentTenantService
{
    // Static IDs for now as per requirements
    public Guid? CompanyId => Guid.Parse("00000000-0000-0000-0000-000000000001");
    public Guid? BranchId => Guid.Parse("00000000-0000-0000-0000-000000000001");
}

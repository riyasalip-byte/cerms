namespace CERMS.Application.Interfaces;

public interface ICurrentTenantService
{
    Guid? CompanyId { get; }
    Guid? BranchId { get; }
}

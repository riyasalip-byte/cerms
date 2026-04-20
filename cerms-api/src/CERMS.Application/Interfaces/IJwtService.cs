namespace CERMS.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(Guid userId, string email, string role, Guid companyId, Guid branchId);
}

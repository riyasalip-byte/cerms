using CERMS.Application.Interfaces;
using CERMS.Infrastructure.Persistence;

namespace CERMS.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly CermsDbContext _dbContext;

    public UnitOfWork(CermsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SaveChangesAsync(cancellationToken);
    }
}

using CERMS.Application.Interfaces;
using CERMS.Domain.Common;
using CERMS.Infrastructure.Repositories;

namespace CERMS.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly CermsDbContext _dbContext;

    public UnitOfWork(CermsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IRepository<T> Repository<T>() where T : BaseEntity
    {
        return new Repository<T>(_dbContext);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SaveChangesAsync(cancellationToken);
    }
}

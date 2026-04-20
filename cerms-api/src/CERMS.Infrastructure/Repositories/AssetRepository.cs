using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Infrastructure.Repositories;

public class AssetRepository : Repository<Asset>, IAssetRepository
{
    public AssetRepository(CermsDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<Asset?> GetByCodeAsync(string assetCode)
    {
        return await _dbContext.Assets
            .FirstOrDefaultAsync(a => a.AssetCode == assetCode);
    }
}

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

    public async Task<Asset?> GetByRegisterNoAsync(string registerNo, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Assets
            .FirstOrDefaultAsync(a => a.RegisterNo == registerNo, cancellationToken);
    }

    public async Task<string> GetNextAssetCodeAsync(CancellationToken cancellationToken = default)
    {
        var lastCode = await _dbContext.Assets
            .Where(a => a.AssetCode.StartsWith("AST-"))
            .OrderByDescending(a => a.AssetCode)
            .Select(a => a.AssetCode)
            .FirstOrDefaultAsync(cancellationToken);

        var nextNumber = 1;
        if (!string.IsNullOrWhiteSpace(lastCode) &&
            int.TryParse(lastCode["AST-".Length..], out var lastNumber))
        {
            nextNumber = lastNumber + 1;
        }

        return $"AST-{nextNumber:0000}";
    }
}

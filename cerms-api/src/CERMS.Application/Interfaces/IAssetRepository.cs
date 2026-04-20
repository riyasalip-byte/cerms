using CERMS.Domain.Entities;

namespace CERMS.Application.Interfaces;

public interface IAssetRepository : IRepository<Asset>
{
    Task<Asset?> GetByCodeAsync(string assetCode);
}

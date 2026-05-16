using CERMS.Domain.Entities;

namespace CERMS.Application.Interfaces;

public interface IAssetRepository : IRepository<Asset>
{
    Task<Asset?> GetByCodeAsync(string assetCode);
    Task<Asset?> GetByRegisterNoAsync(string registerNo, CancellationToken cancellationToken = default);
    Task<string> GetNextAssetCodeAsync(CancellationToken cancellationToken = default);
}

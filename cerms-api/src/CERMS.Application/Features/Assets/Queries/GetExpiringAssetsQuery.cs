using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Features.Assets.Compliance;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Assets.Queries;

public record GetExpiringAssetsQuery(int Days = 30) : IRequest<Result<IReadOnlyList<AssetExpiryAlertDto>>>;

public class GetExpiringAssetsHandler : IRequestHandler<GetExpiringAssetsQuery, Result<IReadOnlyList<AssetExpiryAlertDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetExpiringAssetsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<AssetExpiryAlertDto>>> Handle(GetExpiringAssetsQuery request, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var warningWindowDays = Math.Max(0, request.Days);
        var warningCutoff = today.AddDays(warningWindowDays);

        var assets = await _unitOfWork.Repository<Asset>().Entities
            .Where(asset => asset.IsActive)
            .Where(asset =>
                asset.FitnessExpiryDate.Date <= warningCutoff ||
                asset.InsuranceExpiryDate.Date <= warningCutoff ||
                asset.PuccExpiryDate.Date <= warningCutoff)
            .ToListAsync(cancellationToken);

        var alerts = assets
            .SelectMany(asset => AssetComplianceExpiry.Evaluate(asset, today, warningWindowDays))
            .OrderBy(alert => alert.Severity == AssetComplianceExpiry.Critical ? 0 : 1)
            .ThenBy(alert => alert.ExpiryDate)
            .ThenBy(alert => alert.AssetCode)
            .ToList();

        return Result<IReadOnlyList<AssetExpiryAlertDto>>.Success(alerts);
    }
}

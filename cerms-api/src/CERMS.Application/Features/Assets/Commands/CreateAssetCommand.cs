using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record CreateAssetCommand(string AssetCode, string Name, string AssetType, decimal CurrentOdometer) : IRequest<Result<Guid>>;

public class CreateAssetHandler : IRequestHandler<CreateAssetCommand, Result<Guid>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAssetHandler(IAssetRepository assetRepository, IUnitOfWork unitOfWork)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateAssetCommand request, CancellationToken cancellationToken)
    {
        var existingAsset = await _assetRepository.GetByCodeAsync(request.AssetCode);
        if (existingAsset != null)
            return Result<Guid>.Failure("Asset code already exists.");

        var asset = new Asset(request.AssetCode, request.Name, request.AssetType, request.CurrentOdometer);
        await _assetRepository.AddAsync(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(asset.Id);
    }
}

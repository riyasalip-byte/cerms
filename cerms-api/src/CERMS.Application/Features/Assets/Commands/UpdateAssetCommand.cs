using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record UpdateAssetCommand(Guid Id, AssetStatus Status, decimal CurrentOdometer) : IRequest<Result>;

public class UpdateAssetHandler : IRequestHandler<UpdateAssetCommand, Result>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAssetHandler(IAssetRepository assetRepository, IUnitOfWork unitOfWork)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Id);
        if (asset == null)
            return Result.Failure("Asset not found.");

        asset.UpdateStatus(request.Status);
        
        try 
        {
            asset.UpdateOdometer(request.CurrentOdometer);
        }
        catch (ArgumentException ex)
        {
            return Result.Failure(ex.Message);
        }

        _assetRepository.Update(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

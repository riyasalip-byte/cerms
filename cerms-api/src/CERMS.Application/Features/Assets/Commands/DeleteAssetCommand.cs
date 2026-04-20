using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record DeleteAssetCommand(Guid Id) : IRequest<Result>;

public class DeleteAssetHandler : IRequestHandler<DeleteAssetCommand, Result>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteAssetHandler(IAssetRepository assetRepository, IUnitOfWork unitOfWork)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Id);
        if (asset == null)
            return Result.Failure("Asset not found.");

        _assetRepository.Delete(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

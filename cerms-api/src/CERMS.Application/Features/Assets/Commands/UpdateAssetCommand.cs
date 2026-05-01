using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record UpdateAssetCommand(Guid Id, string Name, string AssetType, AssetStatus Status, decimal CurrentOdometer) : IRequest<Result<AssetDto>>;

public class UpdateAssetHandler : IRequestHandler<UpdateAssetCommand, Result<AssetDto>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateAssetHandler(IAssetRepository assetRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<AssetDto>> Handle(UpdateAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Id);
        if (asset == null)
            return Result<AssetDto>.Failure("Asset not found.");

        try 
        {
            asset.UpdateDetails(request.Name, request.AssetType);
            asset.UpdateStatus(request.Status);
            asset.UpdateOdometer(request.CurrentOdometer);
        }
        catch (Exception ex) when (ex is ArgumentException || ex is InvalidOperationException)
        {
            return Result<AssetDto>.Failure(ex.Message);
        }

        _assetRepository.Update(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<AssetDto>(asset);
        return Result<AssetDto>.Success(dto);
    }
}

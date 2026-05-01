using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record CreateAssetCommand(string AssetCode, string Name, string AssetType, decimal CurrentOdometer, DateTime? PurchaseDate = null, decimal ServiceIntervalKm = 10000) : IRequest<Result<AssetDto>>;

public class CreateAssetHandler : IRequestHandler<CreateAssetCommand, Result<AssetDto>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateAssetHandler(IAssetRepository assetRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<AssetDto>> Handle(CreateAssetCommand request, CancellationToken cancellationToken)
    {
        var existingAsset = await _assetRepository.GetByCodeAsync(request.AssetCode);
        if (existingAsset != null)
            return Result<AssetDto>.Failure("Asset code already exists.");

        var asset = new Asset(
            request.AssetCode, 
            request.Name, 
            request.AssetType, 
            request.CurrentOdometer, 
            request.PurchaseDate ?? DateTime.UtcNow, 
            request.ServiceIntervalKm);
            
        await _assetRepository.AddAsync(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var assetDto = _mapper.Map<AssetDto>(asset);
        return Result<AssetDto>.Success(assetDto);
    }
}

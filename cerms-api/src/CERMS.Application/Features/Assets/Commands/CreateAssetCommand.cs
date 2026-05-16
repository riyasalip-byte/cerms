using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record CreateAssetCommand(
    string AssetName,
    AssetCategory? AssetCategory,
    DateTime? PurchaseDate,
    decimal? CurrentMeterReading,
    int? MakeYear,
    string? Model,
    string? EngineNo,
    string? ChasisNo,
    string? PlaceOfRegistration,
    string RegisterNo,
    DateTime? RegisterDate,
    DateTime FitnessExpiryDate,
    string? InsuranceCompany,
    string? InsuranceNo,
    DateTime InsuranceExpiryDate,
    DateTime PuccExpiryDate) : IRequest<Result<AssetDto>>;

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
        var existingAsset = await _assetRepository.GetByRegisterNoAsync(request.RegisterNo, cancellationToken);
        if (existingAsset != null)
            return Result<AssetDto>.Failure("Register number already exists.");

        var assetCode = await _assetRepository.GetNextAssetCodeAsync(cancellationToken);

        var asset = new Asset(
            assetCode,
            request.AssetName,
            request.AssetCategory!.Value,
            request.CurrentMeterReading!.Value,
            request.RegisterNo,
            request.FitnessExpiryDate,
            request.InsuranceExpiryDate,
            request.PuccExpiryDate,
            request.PurchaseDate,
            request.MakeYear,
            request.Model,
            request.EngineNo,
            request.ChasisNo,
            request.PlaceOfRegistration,
            request.RegisterDate,
            request.InsuranceCompany,
            request.InsuranceNo);
            
        await _assetRepository.AddAsync(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var assetDto = _mapper.Map<AssetDto>(asset);
        return Result<AssetDto>.Success(assetDto);
    }
}

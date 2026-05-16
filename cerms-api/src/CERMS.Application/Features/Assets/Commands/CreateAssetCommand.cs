using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;

using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record CreateAssetCommand(
    string AssetName,
    Guid? AssetCategoryId,
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
    DateTime PuccExpiryDate,
    bool IsTransportationRequired = false,
    string? TransportationNotes = null) : IRequest<Result<AssetDto>>;

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
            request.AssetCategoryId!.Value,
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
            request.InsuranceNo,
            10000,
            request.IsTransportationRequired,
            request.TransportationNotes);
            
        await _assetRepository.AddAsync(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var assetDto = _mapper.Map<AssetDto>(asset);
        return Result<AssetDto>.Success(assetDto);
    }
}

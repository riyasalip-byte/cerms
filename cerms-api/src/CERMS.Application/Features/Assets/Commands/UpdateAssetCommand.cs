using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record UpdateAssetCommand(
    Guid Id,
    string AssetName,
    AssetCategory? AssetCategory,
    AssetStatus Status,
    decimal? CurrentMeterReading,
    string RegisterNo,
    DateTime FitnessExpiryDate,
    DateTime InsuranceExpiryDate,
    DateTime PuccExpiryDate,
    DateTime? PurchaseDate = null,
    int? MakeYear = null,
    string? Model = null,
    string? EngineNo = null,
    string? ChasisNo = null,
    string? PlaceOfRegistration = null,
    DateTime? RegisterDate = null,
    string? InsuranceCompany = null,
    string? InsuranceNo = null) : IRequest<Result<AssetDto>>;

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
            asset.UpdateDetails(
                request.AssetName,
                request.AssetCategory!.Value,
                request.PurchaseDate,
                request.MakeYear,
                request.Model,
                request.EngineNo,
                request.ChasisNo,
                request.PlaceOfRegistration,
                request.RegisterNo,
                request.RegisterDate,
                request.FitnessExpiryDate,
                request.InsuranceCompany,
                request.InsuranceNo,
                request.InsuranceExpiryDate,
                request.PuccExpiryDate);
            asset.UpdateStatus(request.Status);
            asset.UpdateMeterReading(request.CurrentMeterReading!.Value);
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

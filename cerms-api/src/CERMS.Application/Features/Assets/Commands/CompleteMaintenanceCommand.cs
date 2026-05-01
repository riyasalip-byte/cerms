using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record CompleteMaintenanceCommand(
    Guid AssetId, 
    Guid MaintenanceId, 
    decimal FinalCost, 
    string? Notes = null, 
    DateTime? ServiceDate = null
) : IRequest<Result<MaintenanceRecordDto>>;

public class CompleteMaintenanceHandler : IRequestHandler<CompleteMaintenanceCommand, Result<MaintenanceRecordDto>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CompleteMaintenanceHandler(IAssetRepository assetRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<MaintenanceRecordDto>> Handle(CompleteMaintenanceCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.AssetId);
        if (asset == null)
            return Result<MaintenanceRecordDto>.Failure("Asset not found.");

        var maintenanceRepo = _unitOfWork.Repository<MaintenanceRecord>();
        var maintenance = await maintenanceRepo.GetByIdAsync(request.MaintenanceId);
        
        if (maintenance == null || maintenance.AssetId != request.AssetId)
            return Result<MaintenanceRecordDto>.Failure("Maintenance record not found for this asset.");

        if (maintenance.Status == MaintenanceStatus.Completed)
            return Result<MaintenanceRecordDto>.Failure("Maintenance record is already completed.");

        if (asset.Status != AssetStatus.Maintenance)
            return Result<MaintenanceRecordDto>.Failure("Asset must be in Maintenance status.");

        try
        {
            var costDifference = request.FinalCost - maintenance.Cost;
            
            maintenance.UpdateDetails(request.FinalCost, request.Notes, request.ServiceDate);
            maintenanceRepo.Update(maintenance);

            asset.CompleteMaintenance(costDifference, maintenance.Odometer, maintenance.NextServiceDueDate);
            
            _assetRepository.Update(asset);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = _mapper.Map<MaintenanceRecordDto>(maintenance);
            return Result<MaintenanceRecordDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<MaintenanceRecordDto>.Failure(ex.Message);
        }
    }
}

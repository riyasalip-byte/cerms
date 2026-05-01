using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;

namespace CERMS.Application.Features.Assets.Commands;

public record AddMaintenanceCommand(
    Guid AssetId,
    string Description,
    decimal Cost,
    DateTime ServiceDate,
    decimal Odometer,
    DateTime? NextServiceDueDate
) : IRequest<Result<Guid>>;

public class AddMaintenanceHandler : IRequestHandler<AddMaintenanceCommand, Result<Guid>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddMaintenanceHandler(IAssetRepository assetRepository, IUnitOfWork unitOfWork)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(AddMaintenanceCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.AssetId);
        if (asset == null)
            return Result<Guid>.Failure("Asset not found.");

        try
        {
            var record = new MaintenanceRecord(
                request.AssetId,
                request.Description,
                request.Cost,
                request.ServiceDate,
                request.Odometer,
                request.NextServiceDueDate
            );

            await _unitOfWork.Repository<MaintenanceRecord>().AddAsync(record);

            asset.RecordService(request.Odometer, request.Cost, request.NextServiceDueDate);
            asset.SendToMaintenance();

            _assetRepository.Update(asset);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(record.Id);
        }
        catch (Exception ex) when (ex is ArgumentException || ex is InvalidOperationException)
        {
            return Result<Guid>.Failure(ex.Message);
        }
    }
}

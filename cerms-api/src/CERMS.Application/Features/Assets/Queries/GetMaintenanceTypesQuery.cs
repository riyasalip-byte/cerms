using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Assets.Queries;

public record MaintenanceTypeDto(Guid Id, string Name, string? Description, bool IsPreventiveMaintenance);

public record GetMaintenanceTypesQuery : IRequest<Result<List<MaintenanceTypeDto>>>;

public class GetMaintenanceTypesHandler : IRequestHandler<GetMaintenanceTypesQuery, Result<List<MaintenanceTypeDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMaintenanceTypesHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<MaintenanceTypeDto>>> Handle(GetMaintenanceTypesQuery request, CancellationToken cancellationToken)
    {
        var types = await _unitOfWork.Repository<MaintenanceType>().Entities
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(t => !t.IsDeleted && t.IsActive)
            .OrderBy(t => t.Name)
            .Select(t => new MaintenanceTypeDto(t.Id, t.Name, t.Description, t.IsPreventiveMaintenance))
            .ToListAsync(cancellationToken);

        return Result<List<MaintenanceTypeDto>>.Success(types);
    }
}

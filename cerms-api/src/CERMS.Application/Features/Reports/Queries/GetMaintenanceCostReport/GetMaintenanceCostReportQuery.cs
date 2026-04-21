using CERMS.Application.Common.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Reports.Queries.GetMaintenanceCostReport;

public record GetMaintenanceCostReportQuery : IRequest<List<ChartDataDto>>;

public class GetMaintenanceCostReportQueryHandler : IRequestHandler<GetMaintenanceCostReportQuery, List<ChartDataDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMaintenanceCostReportQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ChartDataDto>> Handle(GetMaintenanceCostReportQuery request, CancellationToken cancellationToken)
    {
        var data = await _unitOfWork.Repository<Asset>().Entities
            .AsNoTracking()
            .Select(a => new ChartDataDto
            {
                Label = a.Name,
                Value = a.MaintenanceCost
            })
            .OrderByDescending(x => x.Value)
            .ToListAsync(cancellationToken);

        return data;
    }
}

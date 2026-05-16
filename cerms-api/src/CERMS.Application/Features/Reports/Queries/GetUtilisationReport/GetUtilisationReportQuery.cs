using CERMS.Application.Common.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Reports.Queries.GetUtilisationReport;

public record GetUtilisationReportQuery : IRequest<List<ChartDataDto>>;

public class GetUtilisationReportQueryHandler : IRequestHandler<GetUtilisationReportQuery, List<ChartDataDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetUtilisationReportQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ChartDataDto>> Handle(GetUtilisationReportQuery request, CancellationToken cancellationToken)
    {
        var assets = await _unitOfWork.Repository<Asset>().Entities
            .Include(a => a.AssetCategory)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var report = assets
            .GroupBy(a => a.AssetCategory?.Name ?? "Unknown")
            .Select(g => new ChartDataDto
            {
                Label = g.Key,
                Value = g.Count() == 0 ? 0 : Math.Round((decimal)g.Count(a => a.Status == AssetStatus.Rented) / g.Count() * 100, 2)
            })
            .ToList();

        return report;
    }
}

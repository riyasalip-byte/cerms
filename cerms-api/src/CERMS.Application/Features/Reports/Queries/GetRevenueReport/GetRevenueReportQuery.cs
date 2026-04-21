using CERMS.Application.Common.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Reports.Queries.GetRevenueReport;

public record GetRevenueReportQuery(DateTime? StartDate = null, DateTime? EndDate = null) : IRequest<RevenueReportDto>;

public class RevenueReportDto
{
    public decimal TotalRevenue { get; set; }
    public List<ChartDataDto> RevenuePerDay { get; set; } = new();
}

public class GetRevenueReportQueryHandler : IRequestHandler<GetRevenueReportQuery, RevenueReportDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRevenueReportQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<RevenueReportDto> Handle(GetRevenueReportQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<Invoice>().Entities.AsNoTracking();

        if (request.StartDate.HasValue)
            query = query.Where(i => i.IssuedDate >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(i => i.IssuedDate <= request.EndDate.Value);

        var data = await query
            .GroupBy(i => i.IssuedDate.Date)
            .Select(g => new ChartDataDto
            {
                Label = g.Key.ToString("yyyy-MM-dd"),
                Value = g.Sum(i => i.Total)
            })
            .OrderBy(x => x.Label)
            .ToListAsync(cancellationToken);

        return new RevenueReportDto
        {
            TotalRevenue = data.Sum(x => x.Value),
            RevenuePerDay = data
        };
    }
}

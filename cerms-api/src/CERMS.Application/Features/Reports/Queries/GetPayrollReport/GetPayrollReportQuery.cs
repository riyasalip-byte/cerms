using CERMS.Application.Common.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Reports.Queries.GetPayrollReport;

public record GetPayrollReportQuery : IRequest<List<ChartDataDto>>;

public class GetPayrollReportQueryHandler : IRequestHandler<GetPayrollReportQuery, List<ChartDataDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPayrollReportQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ChartDataDto>> Handle(GetPayrollReportQuery request, CancellationToken cancellationToken)
    {
        var data = await _unitOfWork.Repository<StaffMember>().Entities
            .AsNoTracking()
            .Select(s => new ChartDataDto
            {
                Label = s.FirstName + " " + s.LastName,
                Value = s.MonthlySalary
            })
            .OrderByDescending(x => x.Value)
            .ToListAsync(cancellationToken);

        return data;
    }
}

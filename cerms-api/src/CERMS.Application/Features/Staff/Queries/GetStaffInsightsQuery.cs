using StaffEntity = CERMS.Domain.Entities.Staff;
using CERMS.Application.Common;
using CERMS.Application.Common.DTOs;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Staff.Queries;

public record GetStaffInsightsQuery : IRequest<Result<StaffInsightsDto>>;

public class GetStaffInsightsHandler : IRequestHandler<GetStaffInsightsQuery, Result<StaffInsightsDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetStaffInsightsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StaffInsightsDto>> Handle(GetStaffInsightsQuery request, CancellationToken cancellationToken)
    {
        var staffQuery = _unitOfWork.Repository<StaffEntity>().Entities;
        var threshold = DateTime.UtcNow.AddDays(30);

        var totalStaff = await staffQuery.CountAsync(cancellationToken);
        var activeOperators = await staffQuery.CountAsync(
            s => s.EmployeeCategory == EmployeeCategory.Operator && s.EmploymentStatus == EmploymentStatus.Active,
            cancellationToken);
        var expiringLicenses = await staffQuery.CountAsync(
            s => s.EmployeeCategory == EmployeeCategory.Operator &&
                 s.LicenseExpiryDate != null &&
                 s.LicenseExpiryDate <= threshold,
            cancellationToken);

        var operatorsByClass = await staffQuery
            .Where(s => s.EmployeeCategory == EmployeeCategory.Operator &&
                        s.EmploymentStatus == EmploymentStatus.Active)
            .SelectMany(s => s.AllowedAssetClasses)
            .GroupBy(sa => sa.AssetClass.Name)
            .Select(g => new ChartDataDto { Label = g.Key, Value = g.Count() })
            .ToListAsync(cancellationToken);

        return Result<StaffInsightsDto>.Success(new StaffInsightsDto
        {
            TotalStaff = totalStaff,
            ActiveOperators = activeOperators,
            ExpiringLicenses = expiringLicenses,
            OperatorsByAssetClass = operatorsByClass
        });
    }
}

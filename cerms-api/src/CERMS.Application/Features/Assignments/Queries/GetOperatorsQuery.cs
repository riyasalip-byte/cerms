using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Assignments.Queries;

public record GetOperatorsQuery : IRequest<Result<List<OperatorDto>>>;

public class GetOperatorsHandler : IRequestHandler<GetOperatorsQuery, Result<List<OperatorDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetOperatorsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<OperatorDto>>> Handle(GetOperatorsQuery request, CancellationToken cancellationToken)
    {
        var operators = await _unitOfWork.Repository<Operator>().Entities
            .Where(o => o.IsActive)
            .Select(o => new OperatorDto
            {
                Id = o.Id,
                OperatorCode = o.OperatorCode,
                FullName = o.FullName,
                MobileNo = o.MobileNo,
                LicenseNumber = o.LicenseNumber,
                DailyWage = o.DailyWage,
                IsActive = o.IsActive
            })
            .ToListAsync(cancellationToken);

        return Result<List<OperatorDto>>.Success(operators);
    }
}

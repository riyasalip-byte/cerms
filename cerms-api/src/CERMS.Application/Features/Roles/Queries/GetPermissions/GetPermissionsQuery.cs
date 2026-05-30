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

namespace CERMS.Application.Features.Roles.Queries.GetPermissions;

public record GetPermissionsQuery : IRequest<Result<List<PermissionDto>>>;

public class GetPermissionsHandler : IRequestHandler<GetPermissionsQuery, Result<List<PermissionDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPermissionsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PermissionDto>>> Handle(GetPermissionsQuery request, CancellationToken cancellationToken)
    {
        var permissions = await _unitOfWork.Repository<Permission>().Entities
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Select(p => new PermissionDto
            {
                Id = p.Id,
                Module = p.Module,
                PermissionCode = p.PermissionCode,
                PermissionName = p.PermissionName,
                Description = p.Description,
                IsSystemPermission = p.IsSystemPermission
            })
            .ToListAsync(cancellationToken);

        return Result<List<PermissionDto>>.Success(permissions);
    }
}

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

namespace CERMS.Application.Features.Roles.Queries.GetRoles;

public record GetRolesQuery : IRequest<Result<List<RoleDto>>>
{
    public bool? OnlyActive { get; init; }
}

public class GetRolesHandler : IRequestHandler<GetRolesQuery, Result<List<RoleDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRolesHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<RoleDto>>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<Role>().Entities.AsNoTracking();

        if (request.OnlyActive == true)
        {
            query = query.Where(r => r.IsActive);
        }

        var roles = await query
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsSystemRole = r.IsSystemRole,
                IsActive = r.IsActive
            })
            .ToListAsync(cancellationToken);

        return Result<List<RoleDto>>.Success(roles);
    }
}

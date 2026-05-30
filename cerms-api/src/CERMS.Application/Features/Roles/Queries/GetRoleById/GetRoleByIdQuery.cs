using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Roles.Queries.GetRoleById;

public record GetRoleByIdQuery : IRequest<Result<RoleDetailDto>>
{
    public Guid Id { get; init; }
}

public class GetRoleByIdHandler : IRequestHandler<GetRoleByIdQuery, Result<RoleDetailDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRoleByIdHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<RoleDetailDto>> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        var role = await _unitOfWork.Repository<Role>().Entities
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (role is null)
            return Result<RoleDetailDto>.Failure("Role not found.");

        var permissions = await _unitOfWork.Repository<RolePermission>().Entities
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == request.Id && !rp.Permission.IsDeleted)
            .Select(rp => new PermissionDto
            {
                Id = rp.Permission.Id,
                Module = rp.Permission.Module,
                PermissionCode = rp.Permission.PermissionCode,
                PermissionName = rp.Permission.PermissionName,
                Description = rp.Permission.Description,
                IsSystemPermission = rp.Permission.IsSystemPermission
            })
            .ToListAsync(cancellationToken);

        var dto = new RoleDetailDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            IsSystemRole = role.IsSystemRole,
            IsActive = role.IsActive,
            Permissions = permissions
        };

        return Result<RoleDetailDto>.Success(dto);
    }
}

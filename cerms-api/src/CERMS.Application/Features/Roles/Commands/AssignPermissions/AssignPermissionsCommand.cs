using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Roles.Commands.AssignPermissions;

public record AssignPermissionsCommand : IRequest<Result<bool>>
{
    public Guid RoleId { get; init; }
    public List<Guid> PermissionIds { get; init; } = new();
}

public class AssignPermissionsHandler : IRequestHandler<AssignPermissionsCommand, Result<bool>>
{
    private readonly IUnitOfWork _unitOfWork;

    public AssignPermissionsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(AssignPermissionsCommand request, CancellationToken cancellationToken)
    {
        var role = await _unitOfWork.Repository<Role>().Entities
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken);

        if (role is null)
            return Result<bool>.Failure("Role not found.");

        // Fetch existing mappings
        var existingMappings = await _unitOfWork.Repository<RolePermission>().Entities
            .IgnoreQueryFilters()
            .Where(rp => rp.RoleId == request.RoleId)
            .ToListAsync(cancellationToken);

        // Delete existing mappings
        foreach (var mapping in existingMappings)
        {
            _unitOfWork.Repository<RolePermission>().Delete(mapping);
        }

        // Add new mappings
        if (request.PermissionIds != null && request.PermissionIds.Any())
        {
            var validPermissionIds = await _unitOfWork.Repository<Permission>().Entities
                .IgnoreQueryFilters()
                .Where(p => request.PermissionIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync(cancellationToken);

            foreach (var permissionId in validPermissionIds)
            {
                var rolePermission = new RolePermission(request.RoleId, permissionId)
                {
                    CompanyId = role.CompanyId,
                    BranchId = role.BranchId
                };
                await _unitOfWork.Repository<RolePermission>().AddAsync(rolePermission);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}

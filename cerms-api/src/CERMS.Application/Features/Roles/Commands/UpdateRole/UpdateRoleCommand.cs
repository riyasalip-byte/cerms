using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Roles.Commands.UpdateRole;

public record UpdateRoleCommand : IRequest<Result<Guid>>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsActive { get; init; }
}

public class UpdateRoleHandler : IRequestHandler<UpdateRoleCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRoleHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _unitOfWork.Repository<Role>().Entities
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (role is null)
            return Result<Guid>.Failure("Role not found.");

        var nameTrimmed = request.Name.Trim();
        var duplicate = await _unitOfWork.Repository<Role>().Entities
            .AnyAsync(r => r.Id != request.Id && r.Name.ToLower() == nameTrimmed.ToLower(), cancellationToken);

        if (duplicate)
            return Result<Guid>.Failure("Another role with the same name already exists.");

        try
        {
            role.UpdateDetails(nameTrimmed, request.Description?.Trim(), request.IsActive);
        }
        catch (InvalidOperationException ex)
        {
            return Result<Guid>.Failure(ex.Message);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<Guid>.Success(role.Id);
    }
}

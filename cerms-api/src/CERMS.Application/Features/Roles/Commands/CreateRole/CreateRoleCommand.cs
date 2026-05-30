using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Roles.Commands.CreateRole;

public record CreateRoleCommand : IRequest<Result<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsActive { get; init; } = true;
}

public class CreateRoleHandler : IRequestHandler<CreateRoleCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateRoleHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var nameTrimmed = request.Name.Trim();
        var duplicate = await _unitOfWork.Repository<Role>().Entities
            .AnyAsync(r => r.Name.ToLower() == nameTrimmed.ToLower(), cancellationToken);

        if (duplicate)
            return Result<Guid>.Failure("Role name already exists.");

        var role = new Role(nameTrimmed, request.Description?.Trim());
        if (!request.IsActive)
        {
            role.UpdateDetails(role.Name, role.Description, false);
        }

        await _unitOfWork.Repository<Role>().AddAsync(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(role.Id);
    }
}

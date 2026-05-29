using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using StaffEntity = CERMS.Domain.Entities.Staff;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Users.Commands.CreateUser;

public record CreateUserCommand : IRequest<Result<Guid>>
{
    public Guid StaffId { get; init; }
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public Guid RoleId { get; init; }
}

public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICurrentTenantService _tenantService;

    public CreateUserHandler(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ICurrentTenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tenantService = tenantService;
    }

    public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var staff = await _unitOfWork.Repository<StaffEntity>().Entities
            .FirstOrDefaultAsync(s => s.Id == request.StaffId, cancellationToken);

        if (staff is null)
            return Result<Guid>.Failure("Staff not found.");

        var existingForStaff = await _unitOfWork.Repository<User>().Entities
            .AnyAsync(u => u.StaffId == request.StaffId, cancellationToken);

        if (existingForStaff || staff.UserId.HasValue)
            return Result<Guid>.Failure("This staff member already has a user account.");

        var duplicate = await _unitOfWork.Repository<User>().Entities
            .AnyAsync(u => u.Email == request.Email || u.Username == request.Username, cancellationToken);

        if (duplicate)
            return Result<Guid>.Failure("Username or email already exists.");

        var roleExists = await _unitOfWork.Repository<Role>().Entities
            .AnyAsync(r => r.Id == request.RoleId, cancellationToken);

        if (!roleExists)
            return Result<Guid>.Failure("Role not found.");

        var user = new User(
            request.Username.Trim(),
            request.Email.Trim(),
            _passwordHasher.HashPassword(request.Password),
            request.StaffId,
            request.RoleId,
            _tenantService.CompanyId ?? Guid.Empty,
            _tenantService.BranchId ?? Guid.Empty);

        await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        staff.UserId = user.Id;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(user.Id);
    }
}

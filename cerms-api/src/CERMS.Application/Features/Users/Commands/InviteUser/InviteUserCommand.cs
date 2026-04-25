using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Users.Commands.InviteUser;

public record InviteUserCommand : IRequest<Result<Guid>>
{
    public string Email { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public UserRole Role { get; init; }
}

public class InviteUserHandler : IRequestHandler<InviteUserCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICurrentTenantService _tenantService;

    public InviteUserHandler(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, ICurrentTenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tenantService = tenantService;
    }

    public async Task<Result<Guid>> Handle(InviteUserCommand request, CancellationToken cancellationToken)
    {
        // Check if user already exists
        var existingUser = await _unitOfWork.Repository<User>()
            .Entities
            .FirstOrDefaultAsync(u => u.Email == request.Email || u.Username == request.Username, cancellationToken);
        
        if (existingUser != null)
        {
            return Result<Guid>.Failure("User with this email or username already exists.");
        }

        // For now, use a default password 'Welcome123!'
        // In production, you would send an invite email with a token
        var passwordHash = _passwordHasher.HashPassword("Welcome123!");

        var user = new User(
            request.Username,
            request.Email,
            passwordHash,
            request.Role,
            _tenantService.CompanyId ?? Guid.Empty,
            _tenantService.BranchId ?? Guid.Empty
        );

        await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(user.Id);
    }
}

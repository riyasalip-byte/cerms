using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResult>;

public record AuthResult(AuthResponse Response, string RefreshToken);

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResult>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public LoginCommandHandler(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IJwtService jwtService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<AuthResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Repository<User>()
            .Entities
            .IgnoreQueryFilters()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        var refreshTokenHash = _jwtService.HashToken(refreshToken);

        var refreshTokenEntity = new RefreshToken(
            refreshTokenHash,
            user.Id,
            DateTime.UtcNow.AddDays(7)
        );

        // Bypass tenant filter for saving refresh token if needed, 
        // but here it should work if company/branch are set.
        refreshTokenEntity.CompanyId = user.CompanyId;
        refreshTokenEntity.BranchId = user.BranchId;

        await _unitOfWork.Repository<RefreshToken>().AddAsync(refreshTokenEntity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResult(new AuthResponse
        {
            AccessToken = accessToken,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role?.Name ?? "NoRole",
                CompanyId = user.CompanyId,
                BranchId = user.BranchId
            }
        }, refreshToken);
    }
}

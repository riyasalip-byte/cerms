using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Auth.Commands.Refresh;

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResult>;

public record AuthResult(AuthResponse Response, string RefreshToken);

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResult>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;

    public RefreshTokenCommandHandler(IUnitOfWork unitOfWork, IJwtService jwtService)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
    }

    public async Task<AuthResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = _jwtService.HashToken(request.RefreshToken);
        
        var refreshTokenEntity = await _unitOfWork.Repository<RefreshToken>()
            .Entities
            .IgnoreQueryFilters()
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.TokenHash == tokenHash, cancellationToken);

        if (refreshTokenEntity == null || !refreshTokenEntity.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        // Rotate token: invalidate old one
        refreshTokenEntity.Revoke();

        var user = refreshTokenEntity.User;
        var newAccessToken = _jwtService.GenerateAccessToken(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        var newRefreshTokenHash = _jwtService.HashToken(newRefreshToken);

        var newRefreshTokenEntity = new RefreshToken(
            newRefreshTokenHash,
            user.Id,
            DateTime.UtcNow.AddDays(7)
        );
        newRefreshTokenEntity.CompanyId = user.CompanyId;
        newRefreshTokenEntity.BranchId = user.BranchId;

        await _unitOfWork.Repository<RefreshToken>().AddAsync(newRefreshTokenEntity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResult(new AuthResponse
        {
            AccessToken = newAccessToken,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CompanyId = user.CompanyId,
                BranchId = user.BranchId
            }
        }, newRefreshToken);
    }
}

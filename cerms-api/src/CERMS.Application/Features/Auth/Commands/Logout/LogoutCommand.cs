using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Auth.Commands.Logout;

public record LogoutCommand(string RefreshToken) : IRequest;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;

    public LogoutCommandHandler(IUnitOfWork unitOfWork, IJwtService jwtService)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
    }

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = _jwtService.HashToken(request.RefreshToken);
        
        var refreshTokenEntity = await _unitOfWork.Repository<RefreshToken>()
            .Entities
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.TokenHash == tokenHash, cancellationToken);

        if (refreshTokenEntity != null)
        {
            refreshTokenEntity.Revoke();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}

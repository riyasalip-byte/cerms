using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Users.Commands.ChangePassword;

public record ChangePasswordCommand(string CurrentPassword, string NewPassword) : IRequest<Result>;

public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICurrentTenantService _tenantService;

    public ChangePasswordHandler(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ICurrentTenantService tenantService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tenantService = tenantService;
    }

    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        if (_tenantService.UserId is null)
            return Result.Failure("Unauthorized.");

        var user = await _unitOfWork.Repository<User>().Entities
            .FirstOrDefaultAsync(u => u.Id == _tenantService.UserId, cancellationToken);

        if (user is null)
            return Result.Failure("User not found.");

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return Result.Failure("Current password is incorrect.");

        user.UpdatePassword(_passwordHasher.HashPassword(request.NewPassword));
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

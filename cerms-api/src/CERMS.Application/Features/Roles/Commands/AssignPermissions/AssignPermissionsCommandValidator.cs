using FluentValidation;

namespace CERMS.Application.Features.Roles.Commands.AssignPermissions;

public class AssignPermissionsCommandValidator : AbstractValidator<AssignPermissionsCommand>
{
    public AssignPermissionsCommandValidator()
    {
        RuleFor(x => x.RoleId)
            .NotEmpty().WithMessage("RoleId is required.");

        RuleFor(x => x.PermissionIds)
            .NotNull().WithMessage("PermissionIds list cannot be null.");
    }
}

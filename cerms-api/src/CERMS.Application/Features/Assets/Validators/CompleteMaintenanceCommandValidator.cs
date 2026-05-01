using CERMS.Application.Features.Assets.Commands;
using FluentValidation;

namespace CERMS.Application.Features.Assets.Validators;

public class CompleteMaintenanceCommandValidator : AbstractValidator<CompleteMaintenanceCommand>
{
    public CompleteMaintenanceCommandValidator()
    {
        RuleFor(v => v.AssetId)
            .NotEmpty().WithMessage("Asset ID is required.");

        RuleFor(v => v.MaintenanceId)
            .NotEmpty().WithMessage("Maintenance ID is required.");

        RuleFor(v => v.FinalCost)
            .GreaterThanOrEqualTo(0).WithMessage("Final cost cannot be negative.");
    }
}

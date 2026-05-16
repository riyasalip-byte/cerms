using CERMS.Application.Features.Assets.Commands;
using FluentValidation;

namespace CERMS.Application.Features.Assets.Validators;

public class AddMaintenanceCommandValidator : AbstractValidator<AddMaintenanceCommand>
{
    public AddMaintenanceCommandValidator()
    {
        RuleFor(v => v.AssetId)
            .NotEmpty().WithMessage("Asset ID is required.");

        RuleFor(v => v.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(v => v.Cost)
            .GreaterThanOrEqualTo(0).WithMessage("Cost must be greater than or equal to 0.");

        RuleFor(v => v.ServiceDate)
            .NotEmpty().WithMessage("Service date is required.")
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Service date cannot be in the future.");

        RuleFor(v => v.Odometer)
            .GreaterThanOrEqualTo(0).WithMessage("Odometer reading must be greater than or equal to 0.");

        RuleFor(v => v.NextServiceDueDate)
            .GreaterThan(v => v.ServiceDate).When(v => v.NextServiceDueDate.HasValue)
            .WithMessage("Next service due date must be after the service date.");

        RuleFor(v => v.NextServiceOdometer)
            .GreaterThan(v => v.Odometer).When(v => v.NextServiceOdometer.HasValue)
            .WithMessage("Next service odometer must be greater than the current service odometer.");
    }
}

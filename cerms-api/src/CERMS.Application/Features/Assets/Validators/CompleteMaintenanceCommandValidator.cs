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

        RuleFor(v => v.SparePartsCost)
            .GreaterThanOrEqualTo(0).WithMessage("Spare parts cost cannot be negative.");

        RuleFor(v => v.LabourCost)
            .GreaterThanOrEqualTo(0).WithMessage("Labour cost cannot be negative.");
    }
}

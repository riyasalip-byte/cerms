using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using FluentValidation;

namespace CERMS.Application.Features.Assets.Validators;

public class AddMaintenanceCommandValidator : AbstractValidator<AddMaintenanceCommand>
{
    public AddMaintenanceCommandValidator(IUnitOfWork unitOfWork)
    {
        RuleFor(v => v.AssetId)
            .NotEmpty().WithMessage("Asset ID is required.");

        RuleFor(v => v.MaintenanceTypeId)
            .NotEmpty().WithMessage("Maintenance type is required.");

        RuleFor(v => v.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(v => v.OdoMeterReading)
            .GreaterThanOrEqualTo(0).WithMessage("Odometer reading must be greater than or equal to 0.");

        RuleFor(v => v.EstimatedCost)
            .GreaterThanOrEqualTo(0).When(v => v.EstimatedCost.HasValue).WithMessage("Estimated cost must be greater than or equal to 0.");

        RuleFor(v => v.ServiceDate)
            .NotEmpty().WithMessage("Service date is required.")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("Service date cannot be in the future.");



        RuleFor(v => v.ServiceVendor)
            .MaximumLength(200).WithMessage("Service vendor must not exceed 200 characters.");

    }
}

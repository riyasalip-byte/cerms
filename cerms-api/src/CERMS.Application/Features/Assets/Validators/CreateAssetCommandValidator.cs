using CERMS.Application.Features.Assets.Commands;
using FluentValidation;

namespace CERMS.Application.Features.Assets.Validators;

public class CreateAssetCommandValidator : AbstractValidator<CreateAssetCommand>
{
    public CreateAssetCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");

        RuleFor(v => v.AssetCode)
            .NotEmpty().WithMessage("Asset code is required.")
            .MaximumLength(50).WithMessage("Asset code must not exceed 50 characters.");

        RuleFor(v => v.AssetType)
            .NotEmpty().WithMessage("Asset type is required.")
            .MaximumLength(100).WithMessage("Asset type must not exceed 100 characters.");

        RuleFor(v => v.CurrentOdometer)
            .GreaterThanOrEqualTo(0).WithMessage("Current odometer must be greater than or equal to 0.");
            
        RuleFor(v => v.ServiceIntervalKm)
            .GreaterThan(0).WithMessage("Service interval must be greater than 0.");
    }
}

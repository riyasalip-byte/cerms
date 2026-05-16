using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Interfaces;
using FluentValidation;

namespace CERMS.Application.Features.Assets.Validators;

public class CreateAssetCommandValidator : AbstractValidator<CreateAssetCommand>
{
    public CreateAssetCommandValidator(IAssetRepository assetRepository)
    {
        RuleFor(v => v.AssetName)
            .NotEmpty().WithMessage("Asset name is required.")
            .MaximumLength(200).WithMessage("Asset name must not exceed 200 characters.");

        RuleFor(v => v.AssetCategoryId)
            .NotNull().WithMessage("Asset category is required.")
            .NotEmpty().WithMessage("Asset category is required.");

        RuleFor(v => v.CurrentMeterReading)
            .NotNull().WithMessage("Current meter reading is required.")
            .GreaterThanOrEqualTo(0).WithMessage("Current meter reading must be greater than or equal to 0.");

        RuleFor(v => v.RegisterNo)
            .NotEmpty().WithMessage("Register number is required.")
            .MaximumLength(100).WithMessage("Register number must not exceed 100 characters.")
            .MustAsync(async (registerNo, cancellationToken) =>
                string.IsNullOrWhiteSpace(registerNo) ||
                await assetRepository.GetByRegisterNoAsync(registerNo, cancellationToken) is null)
            .WithMessage("An asset with this register number already exists.");

        RuleFor(v => v.FitnessExpiryDate)
            .NotEmpty().WithMessage("Fitness expiry date is required.")
            .Must(BeFutureDate).WithMessage("Fitness expiry date must be a future date.");

        RuleFor(v => v.InsuranceExpiryDate)
            .NotEmpty().WithMessage("Insurance expiry date is required.")
            .Must(BeFutureDate).WithMessage("Insurance expiry date must be a future date.");

        RuleFor(v => v.PuccExpiryDate)
            .NotEmpty().WithMessage("PUCC expiry date is required.")
            .Must(BeFutureDate).WithMessage("PUCC expiry date must be a future date.");

        RuleFor(v => v.EngineNo)
            .MaximumLength(100).WithMessage("Engine number must not exceed 100 characters.");

        RuleFor(v => v.ChasisNo)
            .MaximumLength(100).WithMessage("Chasis number must not exceed 100 characters.");

        RuleFor(v => v.InsuranceNo)
            .MaximumLength(100).WithMessage("Insurance number must not exceed 100 characters.");
    }

    private static bool BeFutureDate(DateTime date) => date.Date > DateTime.UtcNow.Date;
}

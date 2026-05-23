using FluentValidation;
using CERMS.Application.Features.Rentals.Commands.CloseRental;

namespace CERMS.Application.Features.Rentals.Commands.CompleteRental;

public class CompleteRentalCommandValidator : AbstractValidator<CompleteRentalCommand>
{
    public CompleteRentalCommandValidator()
    {
        RuleFor(v => v.RentalId)
            .NotEmpty().WithMessage("RentalId is required.");

        RuleFor(v => v.EndOdometer)
            .GreaterThanOrEqualTo(0).WithMessage("End odometer cannot be negative.");

        RuleFor(v => v.ActualEndDateTime)
            .NotEmpty().WithMessage("Actual end date is required.");

        RuleFor(v => v.BillingMode)
            .IsInEnum().WithMessage("Invalid billing mode.");

        RuleFor(v => v.RateType)
            .NotNull().When(v => v.BillingMode == BillingMode.ManualRate)
            .WithMessage("RateType is required when BillingMode is ManualRate.");

        RuleFor(v => v.RateType)
            .IsInEnum().When(v => v.RateType.HasValue)
            .WithMessage("Invalid RateType.");

        RuleFor(v => v.RateAmount)
            .NotNull().When(v => v.BillingMode == BillingMode.ManualRate)
            .WithMessage("RateAmount is required when BillingMode is ManualRate.");

        RuleFor(v => v.RateAmount)
            .GreaterThanOrEqualTo(0).When(v => v.RateAmount.HasValue)
            .WithMessage("RateAmount cannot be negative.");

        RuleFor(v => v.OverrideTotalAmount)
            .NotNull().When(v => v.BillingMode == BillingMode.OverrideTotal)
            .WithMessage("OverrideTotalAmount is required when BillingMode is OverrideTotal.");

        RuleFor(v => v.OverrideTotalAmount)
            .GreaterThanOrEqualTo(0).When(v => v.OverrideTotalAmount.HasValue)
            .WithMessage("OverrideTotalAmount cannot be negative.");

        RuleFor(v => v)
            .Must(v => !v.RateType.HasValue && !v.RateAmount.HasValue && !v.OverrideTotalAmount.HasValue)
            .When(v => v.BillingMode == BillingMode.Auto)
            .WithMessage("Auto billing cannot include manual rate or override total fields.");

        RuleFor(v => v)
            .Must(v => !v.OverrideTotalAmount.HasValue)
            .When(v => v.BillingMode == BillingMode.ManualRate)
            .WithMessage("ManualRate billing cannot include OverrideTotalAmount.");

        RuleFor(v => v)
            .Must(v => !v.RateType.HasValue && !v.RateAmount.HasValue)
            .When(v => v.BillingMode == BillingMode.OverrideTotal)
            .WithMessage("OverrideTotal billing cannot include RateType or RateAmount.");
    }
}

using FluentValidation;

namespace CERMS.Application.Features.Rentals.Commands.CreateRental;

public class CreateRentalCommandValidator : AbstractValidator<CreateRentalCommand>
{
    public CreateRentalCommandValidator()
    {
        RuleFor(v => v.AssetId)
            .NotEmpty().WithMessage("AssetId is required.");

        RuleFor(v => v.CustomerId)
            .NotEmpty().WithMessage("CustomerId is required.");

        RuleFor(v => v.StartDateTime)
            .NotEmpty().WithMessage("StartDateTime is required.");

        RuleFor(v => v.ExpectedEndDateTime)
            .NotEmpty().WithMessage("ExpectedEndDateTime is required.")
            .GreaterThan(v => v.StartDateTime).WithMessage("ExpectedEndDateTime must be after StartDateTime.");

        RuleFor(v => v.RateType)
            .IsInEnum().WithMessage("Invalid RateType.");

        RuleFor(v => v.RateAmount)
            .GreaterThan(0).WithMessage("RateAmount must be greater than zero.");
    }
}

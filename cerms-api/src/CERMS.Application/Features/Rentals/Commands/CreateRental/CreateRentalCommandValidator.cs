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
            .GreaterThanOrEqualTo(v => v.StartDateTime).WithMessage("End date should be greater than or equal to start date.");

        RuleFor(v => v.RateType)
            .IsInEnum().When(v => v.RateType.HasValue).WithMessage("Invalid RateType.");

        RuleFor(v => v.RateAmount)
            .GreaterThanOrEqualTo(0).When(v => v.RateAmount.HasValue).WithMessage("RateAmount cannot be negative.");
    }
}

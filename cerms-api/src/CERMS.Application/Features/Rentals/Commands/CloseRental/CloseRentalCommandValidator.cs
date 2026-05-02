using FluentValidation;

namespace CERMS.Application.Features.Rentals.Commands.CloseRental;

public class CloseRentalCommandValidator : AbstractValidator<CloseRentalCommand>
{
    public CloseRentalCommandValidator()
    {
        RuleFor(v => v.RentalId)
            .NotEmpty().WithMessage("RentalId is required.");

        RuleFor(v => v.EndOdometer)
            .GreaterThanOrEqualTo(0).WithMessage("End odometer cannot be negative.");

        RuleFor(v => v.ActualEndDateTime)
            .NotEmpty().WithMessage("Actual end date is required.");
    }
}

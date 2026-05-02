using FluentValidation;

namespace CERMS.Application.Features.Rentals.Commands.StartRental;

public class StartRentalCommandValidator : AbstractValidator<StartRentalCommand>
{
    public StartRentalCommandValidator()
    {
        RuleFor(v => v.RentalId)
            .NotEmpty().WithMessage("RentalId is required.");

        RuleFor(v => v.StartOdometer)
            .GreaterThanOrEqualTo(0).WithMessage("Start odometer cannot be negative.");
    }
}

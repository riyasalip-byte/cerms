using FluentValidation;

namespace CERMS.Application.Features.Rentals.Commands.ConfirmRental;

public class ConfirmRentalCommandValidator : AbstractValidator<ConfirmRentalCommand>
{
    public ConfirmRentalCommandValidator()
    {
        RuleFor(v => v.RentalId)
            .NotEmpty().WithMessage("RentalId is required.");
    }
}

using FluentValidation;

namespace CERMS.Application.Features.Rentals.Commands.CloseRental;

public class CloseRentalCommandValidator : AbstractValidator<CloseRentalCommand>
{
    public CloseRentalCommandValidator()
    {
        RuleFor(v => v.RentalId)
            .NotEmpty().WithMessage("RentalId is required.");
    }
}

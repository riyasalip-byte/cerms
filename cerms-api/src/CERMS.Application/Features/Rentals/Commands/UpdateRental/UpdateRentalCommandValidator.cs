using FluentValidation;

namespace CERMS.Application.Features.Rentals.Commands.UpdateRental;

public class UpdateRentalCommandValidator : AbstractValidator<UpdateRentalCommand>
{
    public UpdateRentalCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Rental Id is required.");

        RuleFor(v => v.StartDateTime)
            .NotEmpty().WithMessage("StartDateTime is required.");

        RuleFor(v => v.ExpectedEndDateTime)
            .NotEmpty().WithMessage("ExpectedEndDateTime is required.")
            .GreaterThanOrEqualTo(v => v.StartDateTime).WithMessage("End date should be greater than or equal to start date.");

        RuleFor(v => v.RateType)
            .IsInEnum().When(v => v.RateType.HasValue).WithMessage("Invalid RateType.");

        RuleFor(v => v.RateAmount)
            .GreaterThanOrEqualTo(0).When(v => v.RateAmount.HasValue).WithMessage("RateAmount cannot be negative.");

        RuleFor(v => v.SiteName)
            .NotEmpty().WithMessage("Site Name is required.");

        RuleFor(v => v.SiteAddress)
            .NotEmpty().WithMessage("Site Address is required.");

        RuleFor(v => v.AdvanceAmount)
            .GreaterThanOrEqualTo(0).When(v => v.AdvanceAmount.HasValue).WithMessage("Advance amount cannot be negative.");

        RuleFor(v => v.SecurityDepositAmount)
            .GreaterThanOrEqualTo(0).When(v => v.SecurityDepositAmount.HasValue).WithMessage("Security deposit cannot be negative.");

        RuleFor(v => v.PickupTransportCharge)
            .GreaterThanOrEqualTo(0).When(v => v.PickupTransportCharge.HasValue).WithMessage("Pickup transport charge cannot be negative.");

        RuleFor(v => v.ReturnTransportCharge)
            .GreaterThanOrEqualTo(0).When(v => v.ReturnTransportCharge.HasValue).WithMessage("Return transport charge cannot be negative.");

        RuleFor(v => v.FuelResponsibilityType)
            .IsInEnum().WithMessage("Invalid FuelResponsibilityType.");
    }
}

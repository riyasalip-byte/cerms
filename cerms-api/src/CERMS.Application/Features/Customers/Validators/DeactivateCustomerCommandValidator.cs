using CERMS.Application.Features.Customers.Commands;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Customers.Validators;

public class DeactivateCustomerCommandValidator : AbstractValidator<DeactivateCustomerCommand>
{
    public DeactivateCustomerCommandValidator(IUnitOfWork unitOfWork)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                if (id == Guid.Empty) return true;

                return !await unitOfWork.Repository<RentalBooking>().Entities
                    .AnyAsync(rental => rental.CustomerId == id && rental.Status == RentalStatus.Active, cancellationToken);
            })
            .WithMessage("Customer cannot be deactivated while active rentals exist.");
    }
}

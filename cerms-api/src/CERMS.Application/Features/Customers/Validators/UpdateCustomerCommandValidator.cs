using CERMS.Application.Features.Customers.Commands;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Customers.Validators;

public class UpdateCustomerCommandValidator : AbstractValidator<UpdateCustomerCommand>
{
    public UpdateCustomerCommandValidator(IUnitOfWork unitOfWork)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");

        RuleFor(v => v.Phone)
            .NotEmpty().WithMessage("Phone cannot be empty.")
            .MaximumLength(50).WithMessage("Phone must not exceed 50 characters.")
            .MustAsync(async (command, phone, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(phone)) return true;

                var normalizedPhone = phone.Trim().ToLower();
                return !await unitOfWork.Repository<Customer>().Entities
                    .AnyAsync(customer => customer.Id != command.Id && customer.Phone.ToLower() == normalizedPhone, cancellationToken);
            })
            .WithMessage("Phone already exists.");

        RuleFor(v => v.Email)
            .EmailAddress().WithMessage("Email must be a valid email address.")
            .MaximumLength(200).WithMessage("Email must not exceed 200 characters.")
            .When(v => !string.IsNullOrWhiteSpace(v.Email));

        RuleFor(v => v.Address)
            .MaximumLength(500).WithMessage("Address must not exceed 500 characters.");

        RuleFor(v => v.CompanyName)
            .MaximumLength(200).WithMessage("Company name must not exceed 200 characters.");

        RuleFor(v => v)
            .MustAsync(async (command, cancellationToken) =>
            {
                if (command.IsActive) return true;

                return !await unitOfWork.Repository<RentalBooking>().Entities
                    .AnyAsync(rental => rental.CustomerId == command.Id && rental.Status == RentalStatus.Active, cancellationToken);
            })
            .WithMessage("Customer cannot be deactivated while active rentals exist.");
    }
}

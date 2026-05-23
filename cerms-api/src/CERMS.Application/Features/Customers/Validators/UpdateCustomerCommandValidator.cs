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

        RuleFor(v => v.CustomerName)
            .NotEmpty().WithMessage("Customer name is required.")
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters.");

        RuleFor(v => v.CustomerType)
            .IsInEnum().WithMessage("Customer type must be a valid option.");

        RuleFor(v => v.MobileNo)
            .NotEmpty().WithMessage("Mobile number is required.")
            .MaximumLength(50).WithMessage("Mobile number must not exceed 50 characters.")
            .MustAsync(async (command, mobileNo, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(mobileNo)) return true;

                var normalizedMobile = mobileNo.Trim().ToLower();
                return !await unitOfWork.Repository<Customer>().Entities
                    .AnyAsync(customer => customer.Id != command.Id && customer.MobileNo.ToLower() == normalizedMobile, cancellationToken);
            })
            .WithMessage("Mobile number already exists.");

        RuleFor(v => v.AlternateMobileNo)
            .MaximumLength(50).WithMessage("Alternate mobile number must not exceed 50 characters.");

        RuleFor(v => v.WhatsAppNo)
            .MaximumLength(50).WithMessage("WhatsApp number must not exceed 50 characters.");

        RuleFor(v => v.Email)
            .EmailAddress().WithMessage("Email must be a valid email address.")
            .MaximumLength(200).WithMessage("Email must not exceed 200 characters.")
            .When(v => !string.IsNullOrWhiteSpace(v.Email));

        RuleFor(v => v.Address)
            .MaximumLength(500).WithMessage("Address must not exceed 500 characters.");

        RuleFor(v => v.City)
            .MaximumLength(100).WithMessage("City must not exceed 100 characters.");

        RuleFor(v => v.State)
            .MaximumLength(100).WithMessage("State must not exceed 100 characters.");

        RuleFor(v => v.Pincode)
            .MaximumLength(20).WithMessage("Pincode must not exceed 20 characters.");

        // Conditional validation for Company customers
        RuleFor(v => v.ContactPersonName)
            .NotEmpty().WithMessage("Contact person name is required for company customers.")
            .When(v => v.CustomerType == CustomerType.Company);

        RuleFor(v => v.ContactPersonName)
            .MaximumLength(200).WithMessage("Contact person name must not exceed 200 characters.")
            .When(v => !string.IsNullOrWhiteSpace(v.ContactPersonName));

        RuleFor(v => v.ContactPersonMobileNo)
            .NotEmpty().WithMessage("Contact person mobile number is required for company customers.")
            .When(v => v.CustomerType == CustomerType.Company);

        RuleFor(v => v.ContactPersonMobileNo)
            .MaximumLength(50).WithMessage("Contact person mobile number must not exceed 50 characters.")
            .When(v => !string.IsNullOrWhiteSpace(v.ContactPersonMobileNo));

        RuleFor(v => v.ContactPersonAddress)
            .MaximumLength(500).WithMessage("Contact person address must not exceed 500 characters.");

        RuleFor(v => v.GstOrTaxNumber)
            .MaximumLength(100).WithMessage("GST or tax number must not exceed 100 characters.");

        RuleFor(v => v.CreditLimit)
            .GreaterThanOrEqualTo(0).WithMessage("Credit limit must be greater than or equal to 0.");

        RuleFor(v => v.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");

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

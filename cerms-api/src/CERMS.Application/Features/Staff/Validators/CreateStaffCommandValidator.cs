using StaffEntity = CERMS.Domain.Entities.Staff;
using CERMS.Application.Features.Staff.Commands;
using CERMS.Domain.Enums;
using FluentValidation;

namespace CERMS.Application.Features.Staff.Validators;

public class CreateStaffCommandValidator : AbstractValidator<CreateStaffCommand>
{
    public CreateStaffCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.MobileNo).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.EmployeeCategory).IsInEnum();
        RuleFor(x => x.JoiningDate).NotEmpty();
        RuleFor(x => x.Designation).NotEmpty();

        When(x => x.EmployeeCategory == EmployeeCategory.Operator, () =>
        {
            RuleFor(x => x.LicenseNumber).NotEmpty();
            RuleFor(x => x.LicenseExpiryDate).NotEmpty();
        });
    }
}

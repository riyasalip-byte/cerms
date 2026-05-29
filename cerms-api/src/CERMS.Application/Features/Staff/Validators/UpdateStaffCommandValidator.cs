using StaffEntity = CERMS.Domain.Entities.Staff;
using CERMS.Application.Features.Staff.Commands;
using CERMS.Domain.Enums;
using FluentValidation;

namespace CERMS.Application.Features.Staff.Validators;

public class UpdateStaffCommandValidator : AbstractValidator<UpdateStaffCommand>
{
    public UpdateStaffCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.MobileNo).NotEmpty();
        RuleFor(x => x.EmployeeCategory).IsInEnum();
        RuleFor(x => x.JoiningDate).NotEmpty();

        When(x => x.EmployeeCategory == EmployeeCategory.Operator, () =>
        {
            RuleFor(x => x.LicenseNumber).NotEmpty();
            RuleFor(x => x.LicenseExpiryDate).NotEmpty();
        });
    }
}

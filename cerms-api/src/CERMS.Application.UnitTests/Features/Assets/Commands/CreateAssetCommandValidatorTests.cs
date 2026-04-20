using CERMS.Application.Features.Assets.Commands;
using FluentValidation.TestHelper;

namespace CERMS.Application.UnitTests.Features.Assets.Commands;

public class CreateAssetCommandValidatorTests
{
    private readonly CreateAssetCommandValidator _validator;

    public CreateAssetCommandValidatorTests()
    {
        _validator = new CreateAssetCommandValidator();
    }

    [Fact]
    public void Validator_ShouldHaveError_WhenAssetCodeIsEmpty()
    {
        var command = new CreateAssetCommand("", "Name", "Type", 100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(v => v.AssetCode);
    }

    [Fact]
    public void Validator_ShouldHaveError_WhenCurrentOdometerIsNegative()
    {
        var command = new CreateAssetCommand("CODE", "Name", "Type", -1);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(v => v.CurrentOdometer);
    }

    [Fact]
    public void Validator_ShouldNotHaveError_WhenCommandIsValid()
    {
        var command = new CreateAssetCommand("CODE", "Name", "Type", 100);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}

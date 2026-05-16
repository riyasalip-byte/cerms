using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Features.Assets.Validators;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using FluentValidation.TestHelper;
using Moq;

namespace CERMS.Application.UnitTests.Features.Assets.Commands;

public class CreateAssetCommandValidatorTests
{
    private static readonly Guid ExcavatorCategoryId = Guid.Parse("00000000-0000-0000-0000-000000000101");
    private readonly Mock<IAssetRepository> _assetRepositoryMock;
    private readonly CreateAssetCommandValidator _validator;

    public CreateAssetCommandValidatorTests()
    {
        _assetRepositoryMock = new Mock<IAssetRepository>();
        _assetRepositoryMock
            .Setup(r => r.GetByRegisterNoAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Asset?)null);

        _validator = new CreateAssetCommandValidator(_assetRepositoryMock.Object);
    }

    [Fact]
    public async Task Validator_ShouldHaveError_WhenAssetNameIsEmpty()
    {
        var command = CreateValidCommand() with { AssetName = "" };
        var result = await _validator.TestValidateAsync(command);
        result.ShouldHaveValidationErrorFor(v => v.AssetName);
    }

    [Fact]
    public async Task Validator_ShouldHaveError_WhenCurrentMeterReadingIsNegative()
    {
        var command = CreateValidCommand() with { CurrentMeterReading = -1 };
        var result = await _validator.TestValidateAsync(command);
        result.ShouldHaveValidationErrorFor(v => v.CurrentMeterReading);
    }

    [Fact]
    public async Task Validator_ShouldHaveError_WhenRegisterNoIsEmpty()
    {
        var command = CreateValidCommand() with { RegisterNo = "" };
        var result = await _validator.TestValidateAsync(command);
        result.ShouldHaveValidationErrorFor(v => v.RegisterNo)
            .WithErrorMessage("Register number is required.");
    }

    [Fact]
    public async Task Validator_ShouldHaveError_WhenRegisterNoAlreadyExists()
    {
        var command = CreateValidCommand();
        var existingAsset = new Asset(
            "AST-0009",
            "Existing Excavator",
            ExcavatorCategoryId,
            10,
            command.RegisterNo,
            DateTime.UtcNow.AddYears(1),
            DateTime.UtcNow.AddYears(1),
            DateTime.UtcNow.AddMonths(6));

        _assetRepositoryMock
            .Setup(r => r.GetByRegisterNoAsync(command.RegisterNo, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingAsset);

        var result = await _validator.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(v => v.RegisterNo)
            .WithErrorMessage("An asset with this register number already exists.");
    }

    [Fact]
    public async Task Validator_ShouldHaveError_WhenExpiryDatesAreNotFutureDates()
    {
        var command = CreateValidCommand() with
        {
            FitnessExpiryDate = DateTime.UtcNow.Date,
            InsuranceExpiryDate = DateTime.UtcNow.AddDays(-1),
            PuccExpiryDate = DateTime.UtcNow.AddDays(-1)
        };

        var result = await _validator.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(v => v.FitnessExpiryDate)
            .WithErrorMessage("Fitness expiry date must be a future date.");
        result.ShouldHaveValidationErrorFor(v => v.InsuranceExpiryDate)
            .WithErrorMessage("Insurance expiry date must be a future date.");
        result.ShouldHaveValidationErrorFor(v => v.PuccExpiryDate)
            .WithErrorMessage("PUCC expiry date must be a future date.");
    }

    [Fact]
    public async Task Validator_ShouldHaveError_WhenOptionalIdentifiersExceedMaxLength()
    {
        var tooLong = new string('A', 101);
        var command = CreateValidCommand() with
        {
            EngineNo = tooLong,
            ChasisNo = tooLong,
            InsuranceNo = tooLong
        };

        var result = await _validator.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(v => v.EngineNo)
            .WithErrorMessage("Engine number must not exceed 100 characters.");
        result.ShouldHaveValidationErrorFor(v => v.ChasisNo)
            .WithErrorMessage("Chasis number must not exceed 100 characters.");
        result.ShouldHaveValidationErrorFor(v => v.InsuranceNo)
            .WithErrorMessage("Insurance number must not exceed 100 characters.");
    }

    [Fact]
    public async Task Validator_ShouldNotHaveError_WhenCommandIsValid()
    {
        var command = CreateValidCommand();
        var result = await _validator.TestValidateAsync(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    private static CreateAssetCommand CreateValidCommand() => new(
        "Excavator EX-01",
        ExcavatorCategoryId,
        DateTime.UtcNow,
        100,
        2024,
        "320D",
        "ENG-001",
        "CHS-001",
        "Kochi",
        "KL-01-EX-001",
        DateTime.UtcNow,
        DateTime.UtcNow.AddYears(1),
        "Acme Insurance",
        "INS-001",
        DateTime.UtcNow.AddYears(1),
        DateTime.UtcNow.AddMonths(6));
}

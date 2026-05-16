using AutoMapper;
using CERMS.Application.DTOs;
using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Interfaces;
using CERMS.Application.Mappings;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using FluentAssertions;
using Moq;

namespace CERMS.Application.UnitTests.Features.Assets.Commands;

public class CreateAssetHandlerTests
{
    private readonly Mock<IAssetRepository> _assetRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly IMapper _mapper;
    private readonly CreateAssetHandler _handler;

    public CreateAssetHandlerTests()
    {
        _assetRepositoryMock = new Mock<IAssetRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _handler = new CreateAssetHandler(_assetRepositoryMock.Object, _unitOfWorkMock.Object, _mapper);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldReturnSuccess()
    {
        // Arrange
        var command = CreateValidCommand();
        _assetRepositoryMock.Setup(r => r.GetByRegisterNoAsync(command.RegisterNo, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Asset?)null);
        _assetRepositoryMock.Setup(r => r.GetNextAssetCodeAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("AST-0001");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeOfType<AssetDto>();
        result.Value!.AssetCode.Should().Be("AST-0001");
        result.Value.RegisterNo.Should().Be(command.RegisterNo);
        result.Value.FitnessExpiryDate.Should().Be(command.FitnessExpiryDate);
        result.Value.InsuranceExpiryDate.Should().Be(command.InsuranceExpiryDate);
        result.Value.PuccExpiryDate.Should().Be(command.PuccExpiryDate);
        _assetRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Asset>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_GeneratedAssetCode_ShouldBeAssignedToAsset()
    {
        var command = CreateValidCommand();
        _assetRepositoryMock.Setup(r => r.GetByRegisterNoAsync(command.RegisterNo, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Asset?)null);
        _assetRepositoryMock.Setup(r => r.GetNextAssetCodeAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("AST-0042");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.AssetCode.Should().Be("AST-0042");
    }

    [Fact]
    public async Task Handle_DuplicateRegisterNo_ShouldReturnFailure()
    {
        var command = CreateValidCommand();
        var existingAsset = new Asset(
            "AST-0009",
            "Existing Excavator",
            AssetCategory.Excavator,
            10,
            command.RegisterNo,
            DateTime.UtcNow.AddYears(1),
            DateTime.UtcNow.AddYears(1),
            DateTime.UtcNow.AddMonths(6));

        _assetRepositoryMock.Setup(r => r.GetByRegisterNoAsync(command.RegisterNo, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingAsset);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Register number already exists.");
        _assetRepositoryMock.Verify(r => r.GetNextAssetCodeAsync(It.IsAny<CancellationToken>()), Times.Never);
        _assetRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Asset>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    private static CreateAssetCommand CreateValidCommand() => new(
        "Excavator EX-01",
        AssetCategory.Excavator,
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

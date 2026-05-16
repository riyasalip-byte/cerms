using AutoMapper;
using CERMS.Application.DTOs;
using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using FluentAssertions;
using Moq;
using Xunit;

namespace CERMS.Tests.Features.Assets.Commands;

public class CreateAssetHandlerTests
{
    private readonly Mock<IAssetRepository> _assetRepoMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly CreateAssetHandler _handler;

    public CreateAssetHandlerTests()
    {
        _assetRepoMock = new Mock<IAssetRepository>();
        _uowMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();

        _handler = new CreateAssetHandler(_assetRepoMock.Object, _uowMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateAsset()
    {
        // Arrange
        var command = CreateValidCommand();
        _assetRepoMock.Setup(repo => repo.GetByRegisterNoAsync(command.RegisterNo, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Asset?)null);
        
        _assetRepoMock.Setup(repo => repo.GetNextAssetCodeAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("AST-0001");

        var expectedDto = new AssetDto { Id = Guid.NewGuid(), AssetCode = "AST-0001", AssetName = "Excavator" };
        _mapperMock.Setup(m => m.Map<AssetDto>(It.IsAny<Asset>())).Returns(expectedDto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.AssetCode.Should().Be("AST-0001");

        _assetRepoMock.Verify(repo => repo.AddAsync(It.IsAny<Asset>()), Times.Once);
        _uowMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldUseGeneratedAssetCode()
    {
        var command = CreateValidCommand();
        _assetRepoMock.Setup(repo => repo.GetByRegisterNoAsync(command.RegisterNo, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Asset?)null);
        _assetRepoMock.Setup(repo => repo.GetNextAssetCodeAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("AST-0042");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _mapperMock.Verify(m => m.Map<AssetDto>(It.Is<Asset>(asset => asset.AssetCode == "AST-0042")), Times.Once);
    }

    [Fact]
    public async Task Handle_WithDuplicateRegisterNo_ShouldReturnFailure()
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

        _assetRepoMock.Setup(repo => repo.GetByRegisterNoAsync(command.RegisterNo, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingAsset);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Register number already exists.");
        _assetRepoMock.Verify(repo => repo.GetNextAssetCodeAsync(It.IsAny<CancellationToken>()), Times.Never);
        _assetRepoMock.Verify(repo => repo.AddAsync(It.IsAny<Asset>()), Times.Never);
        _uowMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    private static CreateAssetCommand CreateValidCommand() => new(
        "Excavator",
        AssetCategory.Excavator,
        DateTime.UtcNow,
        1000,
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

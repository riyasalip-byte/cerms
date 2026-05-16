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

public class UpdateAssetHandlerTests
{
    private readonly Mock<IAssetRepository> _assetRepoMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly UpdateAssetHandler _handler;

    public UpdateAssetHandlerTests()
    {
        _assetRepoMock = new Mock<IAssetRepository>();
        _uowMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();

        _handler = new UpdateAssetHandler(_assetRepoMock.Object, _uowMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldUpdateAsset()
    {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = CreateAsset();
        // Force the ID for testing (reflection or just assume it updates the existing object)
        
        var command = CreateUpdateCommand(assetId, "Updated Excavator", AssetCategory.BackhoeLoader, AssetStatus.Decommissioned, 1500);

        _assetRepoMock.Setup(repo => repo.GetByIdAsync(assetId))
            .ReturnsAsync(asset);

        var expectedDto = new AssetDto { Id = assetId, AssetName = "Updated Excavator" };
        _mapperMock.Setup(m => m.Map<AssetDto>(asset)).Returns(expectedDto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        asset.AssetName.Should().Be("Updated Excavator");
        asset.AssetCategory.Should().Be(AssetCategory.BackhoeLoader);
        asset.Status.Should().Be(AssetStatus.Decommissioned);
        asset.CurrentMeterReading.Should().Be(1500);

        _assetRepoMock.Verify(repo => repo.Update(asset), Times.Once);
        _uowMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentAsset_ShouldReturnFailure()
    {
        // Arrange
        var command = CreateUpdateCommand(Guid.NewGuid(), "Name", AssetCategory.Excavator, AssetStatus.Available, 100);

        _assetRepoMock.Setup(repo => repo.GetByIdAsync(command.Id))
            .ReturnsAsync((Asset?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Asset not found.");
        
        _assetRepoMock.Verify(repo => repo.Update(It.IsAny<Asset>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithInvalidStatusTransition_ShouldReturnFailure()
    {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = CreateAsset();
        
        // Status is Available. Move to Rented.
        asset.UpdateStatus(AssetStatus.Rented); 
        
        // Attempt to update status to Maintenance directly from Rented
        var command = CreateUpdateCommand(assetId, "Excavator", AssetCategory.Excavator, AssetStatus.Maintenance, 1000);

        _assetRepoMock.Setup(repo => repo.GetByIdAsync(assetId))
            .ReturnsAsync(asset);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Cannot send a rented asset directly to maintenance");
        
        _assetRepoMock.Verify(repo => repo.Update(It.IsAny<Asset>()), Times.Never);
    }

    private static Asset CreateAsset() => new(
        "AST-0001",
        "Excavator",
        AssetCategory.Excavator,
        1000,
        "KL-01-EX-001",
        DateTime.UtcNow.AddYears(1),
        DateTime.UtcNow.AddYears(1),
        DateTime.UtcNow.AddMonths(6),
        DateTime.UtcNow);

    private static UpdateAssetCommand CreateUpdateCommand(Guid id, string name, AssetCategory category, AssetStatus status, decimal meterReading) => new(
        id,
        name,
        category,
        status,
        meterReading,
        "KL-01-EX-001",
        DateTime.UtcNow.AddYears(1),
        DateTime.UtcNow.AddYears(1),
        DateTime.UtcNow.AddMonths(6));
}

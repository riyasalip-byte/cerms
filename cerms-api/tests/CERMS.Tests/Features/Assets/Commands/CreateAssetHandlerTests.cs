using AutoMapper;
using CERMS.Application.DTOs;
using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
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
        var command = new CreateAssetCommand("CAT-01", "Excavator", "Heavy", 1000, DateTime.UtcNow, 10000);
        
        _assetRepoMock.Setup(repo => repo.GetByCodeAsync(command.AssetCode))
            .ReturnsAsync((Asset?)null); // No existing asset

        var expectedDto = new AssetDto { Id = Guid.NewGuid(), AssetCode = "CAT-01", Name = "Excavator" };
        _mapperMock.Setup(m => m.Map<AssetDto>(It.IsAny<Asset>())).Returns(expectedDto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.AssetCode.Should().Be("CAT-01");

        _assetRepoMock.Verify(repo => repo.AddAsync(It.IsAny<Asset>()), Times.Once);
        _uowMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithExistingAssetCode_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreateAssetCommand("CAT-01", "Excavator", "Heavy", 1000, DateTime.UtcNow, 10000);
        var existingAsset = new Asset("CAT-01", "Old Excavator", "Heavy", 5000, DateTime.UtcNow, 10000);

        _assetRepoMock.Setup(repo => repo.GetByCodeAsync(command.AssetCode))
            .ReturnsAsync(existingAsset); 

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Asset code already exists.");

        _assetRepoMock.Verify(repo => repo.AddAsync(It.IsAny<Asset>()), Times.Never);
        _uowMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}

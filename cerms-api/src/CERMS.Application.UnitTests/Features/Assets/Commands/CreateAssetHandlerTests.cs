using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using FluentAssertions;
using Moq;

namespace CERMS.Application.UnitTests.Features.Assets.Commands;

public class CreateAssetHandlerTests
{
    private readonly Mock<IAssetRepository> _assetRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateAssetHandler _handler;

    public CreateAssetHandlerTests()
    {
        _assetRepositoryMock = new Mock<IAssetRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new CreateAssetHandler(_assetRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldReturnSuccess()
    {
        // Arrange
        var command = new CreateAssetCommand("AST001", "Excavator", "Heavy Machinery", 1000);
        _assetRepositoryMock.Setup(r => r.GetByCodeAsync(command.AssetCode))
            .ReturnsAsync((Asset?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
        _assetRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Asset>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateAssetCode_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreateAssetCommand("AST001", "Excavator", "Heavy Machinery", 1000);
        var existingAsset = new Asset(command.AssetCode, "Existing", "Type", 0);
        
        _assetRepositoryMock.Setup(r => r.GetByCodeAsync(command.AssetCode))
            .ReturnsAsync(existingAsset);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Asset code already exists.");
        _assetRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Asset>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}

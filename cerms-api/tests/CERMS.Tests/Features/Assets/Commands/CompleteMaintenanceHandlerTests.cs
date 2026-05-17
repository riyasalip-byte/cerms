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

public class CompleteMaintenanceHandlerTests
{
    private static readonly Guid ExcavatorCategoryId = Guid.Parse("00000000-0000-0000-0000-000000000101");
    private static readonly Guid PreventiveMaintenanceTypeId = Guid.Parse("00000000-0000-0000-0000-000000000201");
    private readonly Mock<IAssetRepository> _assetRepoMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly CompleteMaintenanceHandler _handler;

    public CompleteMaintenanceHandlerTests()
    {
        _assetRepoMock = new Mock<IAssetRepository>();
        _uowMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();

        _handler = new CompleteMaintenanceHandler(_assetRepoMock.Object, _uowMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_WhenAssetInMaintenance_ShouldCompleteMaintenance()
    {
        // Arrange
        var assetId = Guid.NewGuid();
        var maintenanceId = Guid.NewGuid();
        var asset = CreateAsset();
        
        // Force status to Maintenance via valid methods
        asset.SendToMaintenance();

        var record = CreateMaintenanceRecord(assetId);

        var command = new CompleteMaintenanceCommand(assetId, maintenanceId, 600, 0, "Extra parts", DateTime.UtcNow);

        _assetRepoMock.Setup(repo => repo.GetByIdAsync(assetId))
            .ReturnsAsync(asset);

        var maintRepoMock = new Mock<IRepository<MaintenanceRecord>>();
        maintRepoMock.Setup(repo => repo.GetByIdAsync(maintenanceId)).ReturnsAsync(record);
        _uowMock.Setup(u => u.Repository<MaintenanceRecord>()).Returns(maintRepoMock.Object);

        var dto = new MaintenanceRecordDto { Id = maintenanceId, TotalCost = 600, Status = MaintenanceStatus.Completed };
        _mapperMock.Setup(m => m.Map<MaintenanceRecordDto>(It.IsAny<MaintenanceRecord>())).Returns(dto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.FinalCost.Should().Be(600);
        asset.Status.Should().Be(AssetStatus.Available);

        _assetRepoMock.Verify(repo => repo.Update(asset), Times.Once);
        maintRepoMock.Verify(repo => repo.Update(record), Times.Once);
        _uowMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenAssetNotAvailable_ShouldReturnFailure()
    {
        // Arrange
        var command = new CompleteMaintenanceCommand(Guid.NewGuid(), Guid.NewGuid(), 100, 0);

        _assetRepoMock.Setup(repo => repo.GetByIdAsync(command.AssetId))
            .ReturnsAsync((Asset?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Asset not found.");
        
        _assetRepoMock.Verify(repo => repo.Update(It.IsAny<Asset>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenAssetNotInMaintenance_ShouldReturnFailure()
    {
        // Arrange
        var assetId = Guid.NewGuid();
        var maintenanceId = Guid.NewGuid();
        var asset = CreateAsset();
        // Asset starts as Available

        var record = CreateMaintenanceRecord(assetId);

        var command = new CompleteMaintenanceCommand(assetId, maintenanceId, 100, 0);

        _assetRepoMock.Setup(repo => repo.GetByIdAsync(assetId))
            .ReturnsAsync(asset);

        var maintRepoMock = new Mock<IRepository<MaintenanceRecord>>();
        maintRepoMock.Setup(repo => repo.GetByIdAsync(maintenanceId)).ReturnsAsync(record);
        _uowMock.Setup(u => u.Repository<MaintenanceRecord>()).Returns(maintRepoMock.Object);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Asset must be in Maintenance status.");
        
        _assetRepoMock.Verify(repo => repo.Update(It.IsAny<Asset>()), Times.Never);
    }

    private static Asset CreateAsset() => new(
        "AST-0001",
        "Excavator",
        ExcavatorCategoryId,
        1000,
        "KL-01-EX-001",
        DateTime.UtcNow.AddYears(1),
        DateTime.UtcNow.AddYears(1),
        DateTime.UtcNow.AddMonths(6),
        DateTime.UtcNow);

    private static MaintenanceRecord CreateMaintenanceRecord(Guid assetId) => new(
        assetId,
        PreventiveMaintenanceTypeId,
        "Oil Change",
        1200,
        400,
        "Vendor A",
        DateTime.UtcNow);
}

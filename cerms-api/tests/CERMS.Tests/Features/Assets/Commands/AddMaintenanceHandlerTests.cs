using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using FluentAssertions;
using Moq;
using Xunit;

namespace CERMS.Tests.Features.Assets.Commands;

public class AddMaintenanceHandlerTests
{
    private static readonly Guid ExcavatorCategoryId = Guid.Parse("00000000-0000-0000-0000-000000000101");
    private static readonly Guid PreventiveMaintenanceTypeId = Guid.Parse("00000000-0000-0000-0000-000000000201");
    private readonly Mock<IAssetRepository> _assetRepoMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IRepository<MaintenanceRecord>> _maintRepoMock;
    private readonly Mock<IRepository<MaintenanceType>> _typeRepoMock;
    private readonly AddMaintenanceHandler _handler;

    public AddMaintenanceHandlerTests()
    {
        _assetRepoMock = new Mock<IAssetRepository>();
        _uowMock = new Mock<IUnitOfWork>();
        _maintRepoMock = new Mock<IRepository<MaintenanceRecord>>();
        _typeRepoMock = new Mock<IRepository<MaintenanceType>>();

        _uowMock.Setup(u => u.Repository<MaintenanceRecord>()).Returns(_maintRepoMock.Object);
        _uowMock.Setup(u => u.Repository<MaintenanceType>()).Returns(_typeRepoMock.Object);
        _typeRepoMock.Setup(repo => repo.GetByIdAsync(PreventiveMaintenanceTypeId))
            .ReturnsAsync(new MaintenanceType(PreventiveMaintenanceTypeId, "Preventive Maintenance", null, true));

        _handler = new AddMaintenanceHandler(_assetRepoMock.Object, _uowMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldAddMaintenanceAndSendAssetToMaintenance()
    {
        // Arrange
        var assetId = Guid.NewGuid();
        var asset = CreateAsset();
        
        var command = new AddMaintenanceCommand(
            assetId,
            PreventiveMaintenanceTypeId,
            "Oil Change",
            1500,
            350,
            150,
            "Vendor A",
            DateTime.UtcNow,
            DateTime.UtcNow.AddMonths(6),
            null,
            "Routine service");

        _assetRepoMock.Setup(repo => repo.GetByIdAsync(assetId))
            .ReturnsAsync(asset);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        asset.Status.Should().Be(AssetStatus.Maintenance);
        asset.CurrentMeterReading.Should().Be(1500);
        asset.LastServiceOdometer.Should().Be(1500);
        asset.MaintenanceCost.Should().Be(500);

        _maintRepoMock.Verify(repo => repo.AddAsync(It.IsAny<MaintenanceRecord>()), Times.Once);
        _assetRepoMock.Verify(repo => repo.Update(asset), Times.Once);
        _uowMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentAsset_ShouldReturnFailure()
    {
        // Arrange
        var command = new AddMaintenanceCommand(
            Guid.NewGuid(),
            PreventiveMaintenanceTypeId,
            "Oil Change",
            1500,
            350,
            150,
            "Vendor A",
            DateTime.UtcNow,
            DateTime.UtcNow.AddMonths(6),
            null,
            null);

        _assetRepoMock.Setup(repo => repo.GetByIdAsync(command.AssetId))
            .ReturnsAsync((Asset?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Asset not found.");

        _maintRepoMock.Verify(repo => repo.AddAsync(It.IsAny<MaintenanceRecord>()), Times.Never);
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
}

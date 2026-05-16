using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class MaintenanceRecordConfiguration : IEntityTypeConfiguration<MaintenanceRecord>
{
    public void Configure(EntityTypeBuilder<MaintenanceRecord> builder)
    {
        builder.ToTable("maintenance_records");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(m => m.OdoMeterReading)
            .HasPrecision(18, 2);

        builder.Property(m => m.EstimatedCost)
            .HasPrecision(18, 2);

        builder.Property(m => m.SparePartsCost)
            .HasPrecision(18, 2);

        builder.Property(m => m.LabourCost)
            .HasPrecision(18, 2);

        builder.Property(m => m.TotalCost)
            .HasPrecision(18, 2);

        builder.Property(m => m.ServiceVendor)
            .HasMaxLength(200);

        builder.Property(m => m.ServiceDate)
            .IsRequired();
            
        builder.Property(m => m.NextServiceOdoMeterReading)
            .HasPrecision(18, 2);

        builder.Property(m => m.ServiceRemarks)
            .HasMaxLength(1000);
            
        builder.HasOne(m => m.Asset)
            .WithMany(a => a.MaintenanceRecords)
            .HasForeignKey(m => m.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.MaintenanceType)
            .WithMany(t => t.MaintenanceRecords)
            .HasForeignKey(m => m.MaintenanceTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

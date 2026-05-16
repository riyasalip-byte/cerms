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

        builder.Property(m => m.Cost)
            .HasPrecision(18, 2);

        builder.Property(m => m.Odometer)
            .HasPrecision(18, 2);

        builder.Property(m => m.ServiceDate)
            .IsRequired();
            
        builder.Property(m => m.NextServiceOdometer)
            .HasPrecision(18, 2);
            
        // The foreign key is already configured from the Asset side,
        // but can also be explicitly stated here.
        builder.HasOne(m => m.Asset)
            .WithMany(a => a.MaintenanceRecords)
            .HasForeignKey(m => m.AssetId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

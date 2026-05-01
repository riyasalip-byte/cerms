using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("assets");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.AssetCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.AssetType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(a => a.CurrentOdometer)
            .HasPrecision(18, 2);
            
        builder.Property(a => a.LastServiceOdometer)
            .HasPrecision(18, 2);
            
        builder.Property(a => a.PurchaseDate)
            .IsRequired();
            
        builder.Property(a => a.IsActive)
            .HasDefaultValue(true);

        builder.Property(a => a.MaintenanceCost)
            .HasPrecision(18, 2);
            
        builder.Property(a => a.ServiceIntervalKm)
            .HasPrecision(18, 2);
            
        builder.Property(a => a.NextServiceDueDate);
            
        builder.HasIndex(a => a.AssetCode).IsUnique();
        
        builder.HasMany(a => a.MaintenanceRecords)
            .WithOne(m => m.Asset)
            .HasForeignKey(m => m.AssetId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

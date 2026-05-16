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

        builder.Property(a => a.AssetName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.AssetCategory)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(a => a.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(a => a.CurrentMeterReading)
            .IsRequired()
            .HasPrecision(18, 2);
            
        builder.Property(a => a.LastServiceOdometer)
            .HasPrecision(18, 2);
            
        builder.Property(a => a.Model)
            .HasMaxLength(100);

        builder.Property(a => a.EngineNo)
            .HasMaxLength(100);

        builder.Property(a => a.ChasisNo)
            .HasMaxLength(100);

        builder.Property(a => a.PlaceOfRegistration)
            .HasMaxLength(200);

        builder.Property(a => a.RegisterNo)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.FitnessExpiryDate)
            .IsRequired();

        builder.Property(a => a.InsuranceCompany)
            .HasMaxLength(200);

        builder.Property(a => a.InsuranceNo)
            .HasMaxLength(100);

        builder.Property(a => a.InsuranceExpiryDate)
            .IsRequired();

        builder.Property(a => a.PuccExpiryDate)
            .IsRequired();
            
        builder.Property(a => a.IsActive)
            .HasDefaultValue(true);

        builder.Property(a => a.MaintenanceCost)
            .HasPrecision(18, 2);
            
        builder.Property(a => a.ServiceIntervalKm)
            .HasPrecision(18, 2);
            
        builder.Property(a => a.NextServiceDueDate);
            
        builder.HasIndex(a => a.AssetCode).IsUnique();
        builder.HasIndex(a => a.RegisterNo);
        builder.HasIndex(a => a.InsuranceNo);
        
        builder.HasMany(a => a.MaintenanceRecords)
            .WithOne(m => m.Asset)
            .HasForeignKey(m => m.AssetId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

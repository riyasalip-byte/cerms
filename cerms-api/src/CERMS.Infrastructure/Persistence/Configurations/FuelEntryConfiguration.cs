using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class FuelEntryConfiguration : IEntityTypeConfiguration<FuelEntry>
{
    public void Configure(EntityTypeBuilder<FuelEntry> builder)
    {
        builder.ToTable("FuelEntries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.FuelQuantityLiters)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(e => e.FuelRatePerLiter)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(e => e.TotalFuelCost)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(e => e.OdoMeterReading)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(e => e.HourMeterReading)
            .HasPrecision(18, 2);

        builder.Property(e => e.FuelStationName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.DriverName)
            .HasMaxLength(200);

        builder.Property(e => e.ReferenceNo)
            .HasMaxLength(100);

        builder.Property(e => e.Remarks)
            .HasMaxLength(500);

        builder.HasOne(e => e.Asset)
            .WithMany() // Assuming Asset doesn't explicitly have an IReadOnlyCollection<FuelEntry> yet
            .HasForeignKey(e => e.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.RentalBooking)
            .WithMany()
            .HasForeignKey(e => e.RentalId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

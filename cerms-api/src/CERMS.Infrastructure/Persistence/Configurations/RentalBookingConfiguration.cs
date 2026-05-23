using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class RentalBookingConfiguration : IEntityTypeConfiguration<RentalBooking>
{
    public void Configure(EntityTypeBuilder<RentalBooking> builder)
    {
        builder.ToTable("rental_bookings");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.RateAmount)
            .IsRequired(false)
            .HasPrecision(18, 2);
            
        builder.Property(r => r.TotalAmount)
            .HasPrecision(18, 2);
            
        builder.Property(r => r.StartOdometer)
            .HasPrecision(18, 2);
            
        builder.Property(r => r.EndOdometer)
            .HasPrecision(18, 2);

        builder.Property(r => r.RateType)
            .IsRequired(false)
            .HasConversion<string>();

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(r => r.SiteName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.SiteAddress)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(r => r.SiteLandmark)
            .HasMaxLength(200);

        builder.Property(r => r.SiteContactPerson)
            .HasMaxLength(100);

        builder.Property(r => r.SiteContactNumber)
            .HasMaxLength(50);

        builder.Property(r => r.PickupTransportCharge)
            .HasPrecision(18, 2);

        builder.Property(r => r.ReturnTransportCharge)
            .HasPrecision(18, 2);

        builder.Property(r => r.TransportNotes)
            .HasMaxLength(1000);

        builder.Property(r => r.AdvanceAmount)
            .HasPrecision(18, 2);

        builder.Property(r => r.SecurityDepositAmount)
            .HasPrecision(18, 2);

        builder.Property(r => r.FuelResponsibilityType)
            .IsRequired()
            .HasConversion<string>();

        builder.HasOne<Asset>()
            .WithMany()
            .HasForeignKey(r => r.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Customer>()
            .WithMany(c => c.RentalBookings)
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.AssetId);
        builder.HasIndex(r => r.Status);
    }
}

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

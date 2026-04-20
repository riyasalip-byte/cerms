using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class RentalBookingConfiguration : IEntityTypeConfiguration<RentalBooking>
{
    public void Configure(EntityTypeBuilder<RentalBooking> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.RentalRate)
            .HasPrecision(18, 2);

        builder.Property(r => r.RateType)
            .IsRequired()
            .HasConversion<string>();

        builder.HasOne<Asset>()
            .WithMany()
            .HasForeignKey(r => r.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Customer>()
            .WithMany()
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

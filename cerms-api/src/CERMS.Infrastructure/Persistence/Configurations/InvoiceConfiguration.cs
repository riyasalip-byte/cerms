using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.Subtotal)
            .HasPrecision(18, 2);

        builder.Property(i => i.Tax)
            .HasPrecision(18, 2);

        builder.Property(i => i.Total)
            .HasPrecision(18, 2);

        builder.Property(i => i.AmountPaid)
            .HasPrecision(18, 2);

        builder.HasIndex(i => i.InvoiceNumber).IsUnique();

        builder.HasOne<RentalBooking>()
            .WithOne()
            .HasForeignKey<Invoice>(i => i.BookingId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.CustomerCode)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.HasIndex(c => c.CustomerCode)
            .IsUnique();

        builder.Property(c => c.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.MobileNo)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.AlternateMobileNo)
            .HasMaxLength(50);

        builder.Property(c => c.Email)
            .HasMaxLength(200);

        builder.Property(c => c.WhatsAppNo)
            .HasMaxLength(50);

        builder.Property(c => c.Address)
            .HasMaxLength(500);

        builder.Property(c => c.City)
            .HasMaxLength(100);

        builder.Property(c => c.State)
            .HasMaxLength(100);

        builder.Property(c => c.Pincode)
            .HasMaxLength(20);

        builder.Property(c => c.ContactPersonName)
            .HasMaxLength(200);

        builder.Property(c => c.ContactPersonMobileNo)
            .HasMaxLength(50);

        builder.Property(c => c.ContactPersonAddress)
            .HasMaxLength(500);

        builder.Property(c => c.GstOrTaxNumber)
            .HasMaxLength(100);

        builder.Property(c => c.CreditLimit)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(c => c.OutstandingBalance)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(c => c.Notes)
            .HasMaxLength(1000);

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);
            
        // Indexes for performance on search queries
        builder.HasIndex(c => c.MobileNo);
        builder.HasIndex(c => c.CustomerName);

        // Relationships
        builder.Metadata.FindNavigation(nameof(Customer.RentalBookings))
            ?.SetPropertyAccessMode(PropertyAccessMode.Field);
    }
}

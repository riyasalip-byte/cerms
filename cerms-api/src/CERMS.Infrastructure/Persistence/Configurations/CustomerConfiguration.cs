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

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Phone)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Email)
            .HasMaxLength(200);

        builder.Property(c => c.Address)
            .HasMaxLength(500);

        builder.Property(c => c.CompanyName)
            .HasMaxLength(200);

        builder.Property(c => c.IDProofNumber)
            .HasMaxLength(100);

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);
            
        // Indexes for performance on search queries
        builder.HasIndex(c => c.Phone);
        builder.HasIndex(c => c.Name);
        builder.HasIndex(c => c.Email).IsUnique();

        // Relationships
        builder.Metadata.FindNavigation(nameof(Customer.RentalBookings))
            ?.SetPropertyAccessMode(PropertyAccessMode.Field);

    }
}

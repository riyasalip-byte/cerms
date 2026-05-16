using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class MaintenanceTypeConfiguration : IEntityTypeConfiguration<MaintenanceType>
{
    public void Configure(EntityTypeBuilder<MaintenanceType> builder)
    {
        builder.ToTable("maintenance_types");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Description)
            .HasMaxLength(500);

        builder.Property(m => m.IsPreventiveMaintenance)
            .HasDefaultValue(false);

        builder.Property(m => m.IsActive)
            .HasDefaultValue(true);

        builder.HasIndex(m => m.Name).IsUnique();
    }
}

using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class AssetClassConfiguration : IEntityTypeConfiguration<AssetClass>
{
    public void Configure(EntityTypeBuilder<AssetClass> builder)
    {
        builder.HasKey(ac => ac.Id);

        builder.Property(ac => ac.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(ac => ac.Description)
            .HasMaxLength(250);

        builder.Property(ac => ac.IsActive)
            .IsRequired();

        builder.HasIndex(ac => ac.Name).IsUnique();
    }
}

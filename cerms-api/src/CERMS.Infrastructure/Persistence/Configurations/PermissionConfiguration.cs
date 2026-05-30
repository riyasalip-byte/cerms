using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Module)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.PermissionCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.PermissionName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(250);

        builder.Property(p => p.IsSystemPermission)
            .IsRequired();

        builder.HasIndex(p => p.PermissionCode)
            .IsUnique();
    }
}

using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(al => al.Id);

        builder.Property(al => al.Action)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(al => al.TableName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(al => al.PrimaryKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(al => al.ChangedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(al => al.OldValues)
            .IsRequired(false);

        builder.Property(al => al.NewValues)
            .IsRequired(false);
            
        builder.HasIndex(al => al.Action);
        builder.HasIndex(al => al.TableName);
        builder.HasIndex(al => al.CreatedAt);
    }
}

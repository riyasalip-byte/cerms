using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class OperatorConfiguration : IEntityTypeConfiguration<Operator>
{
    public void Configure(EntityTypeBuilder<Operator> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OperatorCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.FullName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.MobileNo)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(o => o.AlternateMobileNo)
            .HasMaxLength(20);

        builder.Property(o => o.Address)
            .HasMaxLength(500);

        builder.Property(o => o.LicenseNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.DailyWage)
            .HasPrecision(18, 2);

        builder.HasIndex(o => o.OperatorCode).IsUnique();

        builder.HasOne<User>()
            .WithOne()
            .HasForeignKey<Operator>(o => o.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

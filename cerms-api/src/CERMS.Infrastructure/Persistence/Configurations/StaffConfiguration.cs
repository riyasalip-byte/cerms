using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class StaffConfiguration : IEntityTypeConfiguration<Staff>
{
    public void Configure(EntityTypeBuilder<Staff> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.StaffCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.DisplayName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(s => s.Gender)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.DateOfBirth)
            .IsRequired();

        builder.Property(s => s.MobileNo)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(s => s.EmployeeCategory)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(s => s.EmploymentStatus)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(s => s.JoiningDate)
            .IsRequired();

        builder.Property(s => s.Designation)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Department)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.DailyWage)
            .HasColumnType("decimal(18,2)");

        builder.Property(s => s.Salary)
            .HasColumnType("decimal(18,2)");

        builder.HasIndex(s => s.StaffCode).IsUnique();
        builder.HasIndex(s => s.Email).IsUnique();
        
        // Allowed Asset Classes many-to-many mapping
        builder.HasMany(s => s.AllowedAssetClasses)
            .WithOne(sa => sa.Staff)
            .HasForeignKey(sa => sa.StaffId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

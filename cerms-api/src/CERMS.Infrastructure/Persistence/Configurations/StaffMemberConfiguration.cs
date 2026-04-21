using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class StaffMemberConfiguration : IEntityTypeConfiguration<StaffMember>
{
    public void Configure(EntityTypeBuilder<StaffMember> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.EmployeeCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.MonthlySalary)
            .HasPrecision(18, 2);
            
        builder.HasIndex(s => s.EmployeeCode).IsUnique();

        builder.HasOne<User>()
            .WithOne()
            .HasForeignKey<StaffMember>(s => s.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

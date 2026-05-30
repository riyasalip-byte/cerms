using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.IsActive)
            .IsRequired();

        builder.Property(u => u.LastLoginAt)
            .IsRequired(false);

        builder.HasIndex(u => u.Username).IsUnique();
        builder.HasIndex(u => u.Email).IsUnique();

        // One-to-One relationship: Staff -> User (One Staff = Max One User)
        builder.HasOne(u => u.Staff)
            .WithOne()
            .HasForeignKey<User>(u => u.StaffId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ignore computed backward-compatibility properties so EF doesn't create implicit columns
        builder.Ignore(u => u.RoleId);
        builder.Ignore(u => u.Role);
    }
}

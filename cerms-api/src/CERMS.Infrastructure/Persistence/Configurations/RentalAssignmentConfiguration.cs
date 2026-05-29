using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class RentalAssignmentConfiguration : IEntityTypeConfiguration<RentalAssignment>
{
    public void Configure(EntityTypeBuilder<RentalAssignment> builder)
    {
        builder.HasKey(ra => ra.Id);

        builder.Property(ra => ra.StartMeterReading)
            .HasPrecision(18, 2);

        builder.Property(ra => ra.EndMeterReading)
            .HasPrecision(18, 2);

        builder.Property(ra => ra.StartRemarks)
            .HasMaxLength(500);

        builder.Property(ra => ra.CompletionRemarks)
            .HasMaxLength(500);

        // One-to-One relationship: RentalBooking -> RentalAssignment (RentalId unique index)
        builder.HasOne(ra => ra.RentalBooking)
            .WithOne()
            .HasForeignKey<RentalAssignment>(ra => ra.RentalId)
            .OnDelete(DeleteBehavior.Cascade);

        // One-to-Many relationship: Operator -> RentalAssignments
        builder.HasOne(ra => ra.Operator)
            .WithMany(o => o.Assignments)
            .HasForeignKey(ra => ra.OperatorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

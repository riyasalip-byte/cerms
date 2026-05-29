using CERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CERMS.Infrastructure.Persistence.Configurations;

public class StaffAssetClassConfiguration : IEntityTypeConfiguration<StaffAssetClass>
{
    public void Configure(EntityTypeBuilder<StaffAssetClass> builder)
    {
        builder.HasKey(sa => new { sa.StaffId, sa.AssetClassId });

        builder.HasOne(sa => sa.Staff)
            .WithMany(s => s.AllowedAssetClasses)
            .HasForeignKey(sa => sa.StaffId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sa => sa.AssetClass)
            .WithMany()
            .HasForeignKey(sa => sa.AssetClassId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

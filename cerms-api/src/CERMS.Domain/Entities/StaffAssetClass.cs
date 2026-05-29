using System;

namespace CERMS.Domain.Entities;

public class StaffAssetClass
{
    public Guid StaffId { get; set; }
    public Staff Staff { get; set; }

    public Guid AssetClassId { get; set; }
    public AssetClass AssetClass { get; set; }
}

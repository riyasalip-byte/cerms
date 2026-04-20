using CERMS.Domain.Common;
using CERMS.Domain.Enums;

namespace CERMS.Domain.Entities;

public class Asset : BaseEntity
{
    public string AssetCode { get; private set; }
    public string Name { get; private set; }
    public string AssetType { get; private set; }
    public AssetStatus Status { get; private set; }
    public decimal CurrentOdometer { get; private set; }

    public Asset(string assetCode, string name, string assetType, decimal currentOdometer)
    {
        AssetCode = assetCode;
        Name = name;
        AssetType = assetType;
        CurrentOdometer = currentOdometer;
        Status = AssetStatus.Available;
    }

    public void UpdateStatus(AssetStatus status)
    {
        Status = status;
        Update();
    }

    public void UpdateOdometer(decimal odometer)
    {
        if (odometer < CurrentOdometer)
            throw new ArgumentException("New odometer reading cannot be less than current reading.");
            
        CurrentOdometer = odometer;
        Update();
    }
}

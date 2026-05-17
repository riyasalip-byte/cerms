using CERMS.Domain.Common;

namespace CERMS.Domain.Entities;

public class FuelEntry : BaseEntity
{
    public Guid AssetId { get; private set; }
    public Guid? RentalId { get; private set; }
    
    public DateTime FuelDate { get; private set; }
    public decimal FuelQuantityLiters { get; private set; }
    public decimal FuelRatePerLiter { get; private set; }
    public decimal TotalFuelCost { get; private set; }
    
    public decimal OdoMeterReading { get; private set; }
    public decimal? HourMeterReading { get; private set; }
    
    public string FuelStationName { get; private set; }
    public string? DriverName { get; private set; }
    public string? ReferenceNo { get; private set; }
    public string? Remarks { get; private set; }

    public Asset Asset { get; private set; }
    public RentalBooking? RentalBooking { get; private set; }

    protected FuelEntry() { } // For EF Core

    public FuelEntry(
        Guid assetId,
        DateTime fuelDate,
        decimal fuelQuantityLiters,
        decimal fuelRatePerLiter,
        decimal odoMeterReading,
        string fuelStationName,
        Guid? rentalId = null,
        decimal? hourMeterReading = null,
        string? driverName = null,
        string? referenceNo = null,
        string? remarks = null)
    {
        if (assetId == Guid.Empty) throw new ArgumentException("Asset ID is required.", nameof(assetId));
        if (fuelQuantityLiters <= 0) throw new ArgumentException("Fuel quantity must be greater than zero.", nameof(fuelQuantityLiters));
        if (fuelRatePerLiter < 0) throw new ArgumentException("Fuel rate cannot be negative.", nameof(fuelRatePerLiter));
        if (odoMeterReading < 0) throw new ArgumentException("Odometer reading cannot be negative.", nameof(odoMeterReading));
        if (string.IsNullOrWhiteSpace(fuelStationName)) throw new ArgumentException("Fuel station name is required.", nameof(fuelStationName));

        AssetId = assetId;
        FuelDate = fuelDate;
        FuelQuantityLiters = fuelQuantityLiters;
        FuelRatePerLiter = fuelRatePerLiter;
        TotalFuelCost = fuelQuantityLiters * fuelRatePerLiter;
        OdoMeterReading = odoMeterReading;
        FuelStationName = fuelStationName;
        
        RentalId = rentalId;
        HourMeterReading = hourMeterReading;
        DriverName = driverName;
        ReferenceNo = referenceNo;
        Remarks = remarks;
    }
}

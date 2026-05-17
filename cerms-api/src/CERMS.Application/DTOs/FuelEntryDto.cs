namespace CERMS.Application.DTOs;

public class FuelEntryDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public Guid? RentalId { get; set; }
    
    public DateTime FuelDate { get; set; }
    public decimal FuelQuantityLiters { get; set; }
    public decimal FuelRatePerLiter { get; set; }
    public decimal TotalFuelCost { get; set; }
    
    public decimal OdoMeterReading { get; set; }
    public decimal? HourMeterReading { get; set; }
    
    public string FuelStationName { get; set; } = string.Empty;
    public string? DriverName { get; set; }
    public string? ReferenceNo { get; set; }
    public string? Remarks { get; set; }
    
    public DateTime CreatedAt { get; set; }
}

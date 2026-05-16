using CERMS.Domain.Enums;

namespace CERMS.Application.DTOs;

public class AssetDto
{
    public Guid Id { get; set; }
    public string AssetCode { get; set; } = string.Empty;
    public string AssetName { get; set; } = string.Empty;
    public AssetCategory AssetCategory { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public decimal CurrentMeterReading { get; set; }
    public int? MakeYear { get; set; }
    public string? Model { get; set; }
    public string? EngineNo { get; set; }
    public string? ChasisNo { get; set; }
    public string? PlaceOfRegistration { get; set; }
    public string RegisterNo { get; set; } = string.Empty;
    public DateTime? RegisterDate { get; set; }
    public DateTime FitnessExpiryDate { get; set; }
    public string? InsuranceCompany { get; set; }
    public string? InsuranceNo { get; set; }
    public DateTime InsuranceExpiryDate { get; set; }
    public DateTime PuccExpiryDate { get; set; }
    public AssetStatus Status { get; set; }
    public decimal LastServiceOdometer { get; set; }
    public bool IsActive { get; set; }
    public decimal MaintenanceCost { get; set; }
    public DateTime? NextServiceDueDate { get; set; }
    public decimal? NextServiceOdometer { get; set; }
    public decimal ServiceIntervalKm { get; set; }
    public bool IsTransportationRequired { get; set; }
    public string? TransportationNotes { get; set; }

    [Obsolete("Use AssetName.")]
    public string Name => AssetName;

    [Obsolete("Use AssetCategory.")]
    public string AssetType => AssetCategory.ToString();

    [Obsolete("Use CurrentMeterReading.")]
    public decimal CurrentOdometer => CurrentMeterReading;
}

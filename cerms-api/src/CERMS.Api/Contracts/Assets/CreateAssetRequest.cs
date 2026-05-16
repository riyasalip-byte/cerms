using CERMS.Application.Features.Assets.Commands;

namespace CERMS.Api.Contracts.Assets;

public class CreateAssetRequest
{
    public string? AssetName { get; init; }
    public Guid? AssetCategoryId { get; init; }
    public DateTime? PurchaseDate { get; init; }
    public decimal? CurrentMeterReading { get; init; }
    public int? MakeYear { get; init; }
    public string? Model { get; init; }
    public string? EngineNo { get; init; }
    public string? ChasisNo { get; init; }
    public string? PlaceOfRegistration { get; init; }
    public string? RegisterNo { get; init; }
    public DateTime? RegisterDate { get; init; }
    public DateTime? FitnessExpiryDate { get; init; }
    public string? InsuranceCompany { get; init; }
    public string? InsuranceNo { get; init; }
    public DateTime? InsuranceExpiryDate { get; init; }
    public DateTime? PuccExpiryDate { get; init; }
    public bool? IsTransportationRequired { get; init; }
    public string? TransportationNotes { get; init; }

    public string? Name { get; init; }

    public string? AssetType { get; init; }

    public decimal? CurrentOdometer { get; init; }

    public string? AssetCode { get; init; }

    public CreateAssetCommand ToCommand() => new(
        AssetName ?? Name ?? string.Empty,
        AssetCategoryId,
        PurchaseDate,
        CurrentMeterReading ?? CurrentOdometer,
        MakeYear,
        Model,
        EngineNo,
        ChasisNo,
        PlaceOfRegistration,
        RegisterNo ?? string.Empty,
        RegisterDate,
        FitnessExpiryDate ?? default,
        InsuranceCompany,
        InsuranceNo,
        InsuranceExpiryDate ?? default,
        PuccExpiryDate ?? default,
        IsTransportationRequired ?? false,
        TransportationNotes);

}

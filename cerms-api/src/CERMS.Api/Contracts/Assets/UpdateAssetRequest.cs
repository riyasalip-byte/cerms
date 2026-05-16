using CERMS.Application.Features.Assets.Commands;
using CERMS.Domain.Enums;

namespace CERMS.Api.Contracts.Assets;

public class UpdateAssetRequest
{
    public Guid? Id { get; init; }
    public string? AssetName { get; init; }
    public Guid? AssetCategoryId { get; init; }
    public AssetStatus? Status { get; init; }
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

    public UpdateAssetCommand ToCommand(Guid routeId) => new(
        Id ?? routeId,
        AssetName ?? Name ?? string.Empty,
        AssetCategoryId,
        Status ?? AssetStatus.Available,
        CurrentMeterReading ?? CurrentOdometer,
        RegisterNo ?? string.Empty,
        FitnessExpiryDate ?? default,
        InsuranceExpiryDate ?? default,
        PuccExpiryDate ?? default,
        PurchaseDate,
        MakeYear,
        Model,
        EngineNo,
        ChasisNo,
        PlaceOfRegistration,
        RegisterDate,
        InsuranceCompany,
        InsuranceNo,
        IsTransportationRequired ?? false,
        TransportationNotes);
}

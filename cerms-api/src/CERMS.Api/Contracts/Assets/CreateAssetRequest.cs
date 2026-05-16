using CERMS.Application.Features.Assets.Commands;
using CERMS.Domain.Enums;

namespace CERMS.Api.Contracts.Assets;

public class CreateAssetRequest
{
    public string? AssetName { get; init; }
    public AssetCategory? AssetCategory { get; init; }
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

    public string? Name { get; init; }

    public string? AssetType { get; init; }

    public decimal? CurrentOdometer { get; init; }

    public string? AssetCode { get; init; }

    public CreateAssetCommand ToCommand() => new(
        AssetName ?? Name ?? string.Empty,
        AssetCategory ?? ParseLegacyAssetType(AssetType),
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
        PuccExpiryDate ?? default);

    private static AssetCategory? ParseLegacyAssetType(string? assetType)
    {
        return Enum.TryParse<AssetCategory>(assetType?.Replace(" ", string.Empty), ignoreCase: true, out var category)
            ? category
            : null;
    }
}

using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Rentals.Commands.UpdateRental;

public record UpdateRentalCommand(
    Guid Id,
    DateTime StartDateTime,
    DateTime ExpectedEndDateTime,
    RateType? RateType,
    decimal? RateAmount,
    string SiteName,
    string SiteAddress,
    string? SiteLandmark,
    string? SiteContactPerson,
    string? SiteContactNumber,
    decimal? PickupTransportCharge,
    decimal? ReturnTransportCharge,
    string? TransportNotes,
    decimal? AdvanceAmount,
    decimal? SecurityDepositAmount,
    FuelResponsibilityType FuelResponsibilityType) : IRequest<Result>;

public class UpdateRentalHandler : IRequestHandler<UpdateRentalCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRentalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateRentalCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.Id);
        if (rental == null) return Result.Failure("Rental not found.");

        var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(rental.AssetId);
        if (asset != null && !asset.IsTransportationRequired)
        {
            if ((request.PickupTransportCharge.HasValue && request.PickupTransportCharge.Value > 0) ||
                (request.ReturnTransportCharge.HasValue && request.ReturnTransportCharge.Value > 0))
            {
                return Result.Failure("Transportation charges are not allowed for this equipment as it does not require a transport vehicle.");
            }
        }

        try
        {
            rental.UpdateDetails(
                request.StartDateTime,
                request.ExpectedEndDateTime,
                request.RateType,
                request.RateAmount,
                request.SiteName,
                request.SiteAddress,
                request.SiteLandmark,
                request.SiteContactPerson,
                request.SiteContactNumber,
                request.PickupTransportCharge,
                request.ReturnTransportCharge,
                request.TransportNotes,
                request.AdvanceAmount,
                request.SecurityDepositAmount,
                request.FuelResponsibilityType
            );

            _unitOfWork.Repository<RentalBooking>().Update(rental);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}

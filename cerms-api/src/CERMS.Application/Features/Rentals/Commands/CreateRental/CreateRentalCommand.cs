using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Rentals.Commands.CreateRental;

public record CreateRentalCommand(
    Guid AssetId,
    Guid CustomerId,
    DateTime StartDateTime,
    DateTime ExpectedEndDateTime,
    RateType? RateType = null,
    decimal? RateAmount = null,
    decimal? StartOdometer = null,
    string SiteName = "",
    string SiteAddress = "",
    string? SiteLandmark = null,
    string? SiteContactPerson = null,
    string? SiteContactNumber = null,
    decimal? PickupTransportCharge = null,
    decimal? ReturnTransportCharge = null,
    string? TransportNotes = null,
    decimal? AdvanceAmount = null,
    decimal? SecurityDepositAmount = null,
    FuelResponsibilityType FuelResponsibilityType = FuelResponsibilityType.Customer) : IRequest<Result<RentalDto>>;

public class CreateRentalHandler : IRequestHandler<CreateRentalCommand, Result<RentalDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateRentalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<RentalDto>> Handle(CreateRentalCommand request, CancellationToken cancellationToken)
    {
        var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(request.AssetId);
        if (asset == null) return Result<RentalDto>.Failure("Asset not found.");
        if (asset.Status != AssetStatus.Available) return Result<RentalDto>.Failure("Asset is not available.");

        if (!asset.IsTransportationRequired)
        {
            if ((request.PickupTransportCharge.HasValue && request.PickupTransportCharge.Value > 0) ||
                (request.ReturnTransportCharge.HasValue && request.ReturnTransportCharge.Value > 0))
            {
                return Result<RentalDto>.Failure("Transportation charges are not allowed for this equipment as it does not require a transport vehicle.");
            }
        }

        var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(request.CustomerId);
        if (customer == null) return Result<RentalDto>.Failure("Customer not found.");

        var rental = new RentalBooking(
            request.AssetId,
            request.CustomerId,
            request.StartDateTime,
            request.ExpectedEndDateTime,
            request.RateType,
            request.RateAmount,
            request.StartOdometer,
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

        await _unitOfWork.Repository<RentalBooking>().AddAsync(rental);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var rentalDto = new RentalDto
        {
            Id = rental.Id,
            AssetId = rental.AssetId,
            AssetName = asset.AssetName,
            CustomerId = rental.CustomerId,
            CustomerName = customer.CustomerName,
            StartDateTime = rental.StartDateTime,
            ExpectedEndDateTime = rental.ExpectedEndDateTime,
            ActualEndDateTime = rental.ActualEndDateTime,
            Status = rental.Status,
            RateType = rental.RateType,
            RateAmount = rental.RateAmount,
            StartOdometer = rental.StartOdometer,
            EndOdometer = rental.EndOdometer,
            TotalAmount = rental.TotalAmount,
            IsInvoiced = rental.IsInvoiced,
            SiteName = rental.SiteName,
            SiteAddress = rental.SiteAddress,
            SiteLandmark = rental.SiteLandmark,
            SiteContactPerson = rental.SiteContactPerson,
            SiteContactNumber = rental.SiteContactNumber,
            PickupTransportCharge = rental.PickupTransportCharge,
            ReturnTransportCharge = rental.ReturnTransportCharge,
            TransportNotes = rental.TransportNotes,
            AdvanceAmount = rental.AdvanceAmount,
            SecurityDepositAmount = rental.SecurityDepositAmount,
            FuelResponsibilityType = rental.FuelResponsibilityType
        };

        return Result<RentalDto>.Success(rentalDto);
    }
}

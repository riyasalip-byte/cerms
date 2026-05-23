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
    decimal? StartOdometer = null) : IRequest<Result<RentalDto>>;

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

        var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(request.CustomerId);
        if (customer == null) return Result<RentalDto>.Failure("Customer not found.");

        var rental = new RentalBooking(
            request.AssetId,
            request.CustomerId,
            request.StartDateTime,
            request.ExpectedEndDateTime,
            request.RateType,
            request.RateAmount,
            request.StartOdometer
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
            IsInvoiced = rental.IsInvoiced
        };

        return Result<RentalDto>.Success(rentalDto);
    }
}

using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Rentals.Commands.ConfirmRental;

public record ConfirmRentalCommand(Guid RentalId) : IRequest<Result<Unit>>;

public class ConfirmRentalHandler : IRequestHandler<ConfirmRentalCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public ConfirmRentalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(ConfirmRentalCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.RentalId);
        if (rental == null) return Result<Unit>.Failure("Rental not found.");

        if (rental.Status != RentalStatus.Draft)
            return Result<Unit>.Failure("Only draft rentals can be confirmed.");

        var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(rental.AssetId);
        if (asset == null) return Result<Unit>.Failure("Asset not found.");

        if (asset.Status != AssetStatus.Available)
            return Result<Unit>.Failure("Asset is not available for rent.");

        // Prevent double booking
        bool isDoubleBooked = await _unitOfWork.Repository<RentalBooking>().Entities
            .AnyAsync(r => r.AssetId == rental.AssetId &&
                           r.Id != rental.Id &&
                           (r.Status == RentalStatus.Confirmed || r.Status == RentalStatus.Active) &&
                           r.StartDateTime < rental.ExpectedEndDateTime &&
                           r.ExpectedEndDateTime > rental.StartDateTime,
                           cancellationToken);

        if (isDoubleBooked)
            return Result<Unit>.Failure("Asset is already booked for this timeframe.");

        try
        {
            rental.Confirm();
            asset.Rent(); // Sets Asset.Status to Rented

            _unitOfWork.Repository<RentalBooking>().Update(rental);
            _unitOfWork.Repository<Asset>().Update(asset);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
        catch (InvalidOperationException ex)
        {
            return Result<Unit>.Failure(ex.Message);
        }
    }
}

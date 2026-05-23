using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Rentals.Commands.CancelRental;

public record CancelRentalCommand(Guid RentalId) : IRequest<Result<Unit>>;

public class CancelRentalHandler : IRequestHandler<CancelRentalCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CancelRentalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(CancelRentalCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.RentalId);
        if (rental == null) return Result<Unit>.Failure("Rental not found.");

        if (rental.Status != RentalStatus.Draft && rental.Status != RentalStatus.Confirmed)
            return Result<Unit>.Failure("Only Draft or Confirmed rentals can be cancelled.");

        try
        {
            var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(rental.AssetId);
            if (asset != null && rental.Status == RentalStatus.Confirmed)
            {
                asset.UpdateStatus(AssetStatus.Available);
                _unitOfWork.Repository<Asset>().Update(asset);
            }

            rental.Cancel();
            _unitOfWork.Repository<RentalBooking>().Update(rental);
            
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
        catch (InvalidOperationException ex)
        {
            return Result<Unit>.Failure(ex.Message);
        }
    }
}

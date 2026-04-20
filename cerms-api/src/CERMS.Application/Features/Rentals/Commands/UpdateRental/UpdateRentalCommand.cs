using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Rentals.Commands.UpdateRental;

public record UpdateRentalCommand(Guid Id, RentalStatus Status) : IRequest<Result>;

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

        try
        {
            switch (request.Status)
            {
                case RentalStatus.Confirmed:
                    rental.Confirm();
                    break;
                case RentalStatus.Active:
                    rental.Activate();
                    // When active, mark asset as Rented
                    var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(rental.AssetId);
                    asset?.UpdateStatus(AssetStatus.Rented);
                    break;
                default:
                    return Result.Failure("Invalid status transition via UpdateRental.");
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}

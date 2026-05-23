using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Rentals.Commands.StartRental;

public record StartRentalCommand(Guid RentalId, decimal StartOdometer) : IRequest<Result<Unit>>;

public class StartRentalHandler : IRequestHandler<StartRentalCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public StartRentalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(StartRentalCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.RentalId);
        if (rental == null) return Result<Unit>.Failure("Rental not found.");

        if (rental.Status != RentalStatus.Dispatched)
            return Result<Unit>.Failure("Only dispatched rentals can be started.");

        try
        {
            rental.Activate(request.StartOdometer);
            
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

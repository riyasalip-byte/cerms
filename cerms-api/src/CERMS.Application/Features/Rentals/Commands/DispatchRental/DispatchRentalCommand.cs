using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Rentals.Commands.DispatchRental;

public record DispatchRentalCommand(Guid RentalId) : IRequest<Result<Unit>>;

public class DispatchRentalHandler : IRequestHandler<DispatchRentalCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DispatchRentalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(DispatchRentalCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.RentalId);
        if (rental == null) return Result<Unit>.Failure("Rental not found.");

        if (rental.Status != RentalStatus.Confirmed)
            return Result<Unit>.Failure("Only confirmed rentals can be dispatched.");

        try
        {
            rental.Dispatch();
            
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

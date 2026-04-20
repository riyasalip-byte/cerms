using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;

namespace CERMS.Application.Features.Rentals.Commands.ExtendRental;

public record ExtendRentalCommand(Guid Id, DateTime NewExpectedEndDate) : IRequest<Result>;

public class ExtendRentalHandler : IRequestHandler<ExtendRentalCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public ExtendRentalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ExtendRentalCommand request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().GetByIdAsync(request.Id);
        if (rental == null) return Result.Failure("Rental not found.");

        try
        {
            rental.Extend(request.NewExpectedEndDate);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}

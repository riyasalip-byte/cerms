using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Customers.Commands;

public record DeactivateCustomerCommand(Guid Id) : IRequest<Result>;

public class DeactivateCustomerHandler : IRequestHandler<DeactivateCustomerCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeactivateCustomerHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeactivateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(request.Id);
        if (customer == null)
            return Result.Failure("Customer not found.");

        var hasActiveRentals = await _unitOfWork.Repository<RentalBooking>().Entities
            .AnyAsync(rental => rental.CustomerId == request.Id && rental.Status == RentalStatus.Active, cancellationToken);

        if (hasActiveRentals)
            return Result.Failure("Customer cannot be deactivated while active rentals exist.");

        customer.Deactivate();

        _unitOfWork.Repository<Customer>().Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

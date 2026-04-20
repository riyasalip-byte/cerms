using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Rentals.Commands.CreateRental;

public record CreateRentalCommand(
    Guid AssetId,
    Guid CustomerId,
    DateTime StartDate,
    DateTime ExpectedEndDate,
    RateType RateType,
    decimal RentalRate) : IRequest<Result<Guid>>;

public class CreateRentalHandler : IRequestHandler<CreateRentalCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateRentalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateRentalCommand request, CancellationToken cancellationToken)
    {
        var asset = await _unitOfWork.Repository<Asset>().GetByIdAsync(request.AssetId);
        if (asset == null) return Result<Guid>.Failure("Asset not found.");
        if (asset.Status != AssetStatus.Available) return Result<Guid>.Failure("Asset is not available.");

        var customerExists = await _unitOfWork.Repository<Customer>().Entities
            .AnyAsync(c => c.Id == request.CustomerId, cancellationToken);
        if (!customerExists) return Result<Guid>.Failure("Customer not found.");

        var rental = new RentalBooking(
            request.AssetId,
            request.CustomerId,
            request.StartDate,
            request.ExpectedEndDate,
            request.RateType,
            request.RentalRate
        );

        await _unitOfWork.Repository<RentalBooking>().AddAsync(rental);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(rental.Id);
    }
}

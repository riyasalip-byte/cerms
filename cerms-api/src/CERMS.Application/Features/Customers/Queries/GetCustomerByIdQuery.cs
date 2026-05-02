using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Customers.Queries;

public record GetCustomerByIdQuery(Guid Id) : IRequest<Result<CustomerDetailDto>>;

public class GetCustomerByIdHandler : IRequestHandler<GetCustomerByIdQuery, Result<CustomerDetailDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCustomerByIdHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerDetailDto>> Handle(GetCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await _unitOfWork.Repository<Customer>().Entities
            .Where(customer => customer.Id == request.Id)
            .Select(customer => new CustomerDetailDto
            {
                Id = customer.Id,
                CustomerCode = customer.CustomerCode,
                Name = customer.Name,
                CompanyName = customer.CompanyName,
                IsActive = customer.IsActive,
                Phone = customer.Phone,
                Email = customer.Email,
                Address = customer.Address
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (customer == null)
            return Result<CustomerDetailDto>.Failure("Customer not found.");

        var rentalsQuery = _unitOfWork.Repository<RentalBooking>().Entities;
        var assetsQuery = _unitOfWork.Repository<Asset>().Entities;
        var customerRentalsQuery = rentalsQuery.Where(rental => rental.CustomerId == request.Id);

        customer.TotalRentalsCount = await customerRentalsQuery.CountAsync(cancellationToken);
        customer.TotalRevenue = await customerRentalsQuery
            .Where(rental => rental.TotalAmount.HasValue)
            .SumAsync(rental => rental.TotalAmount!.Value, cancellationToken);

        customer.RentalHistory = await (from rental in customerRentalsQuery
                                        join asset in assetsQuery on rental.AssetId equals asset.Id
                                        orderby rental.StartDateTime descending
                                        select new CustomerRentalSummaryDto
                                        {
                                            RentalId = rental.Id,
                                            AssetName = asset.Name,
                                            StartDateTime = rental.StartDateTime,
                                            Status = rental.Status,
                                            TotalAmount = rental.TotalAmount
                                        })
            .Take(10)
            .ToListAsync(cancellationToken);

        return Result<CustomerDetailDto>.Success(customer);
    }
}

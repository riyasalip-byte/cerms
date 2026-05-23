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
                CustomerType = customer.CustomerType,
                CustomerName = customer.CustomerName,
                Address = customer.Address,
                MobileNo = customer.MobileNo,
                AlternateMobileNo = customer.AlternateMobileNo,
                Email = customer.Email,
                WhatsAppNo = customer.WhatsAppNo,
                City = customer.City,
                State = customer.State,
                Pincode = customer.Pincode,
                ContactPersonName = customer.ContactPersonName,
                ContactPersonMobileNo = customer.ContactPersonMobileNo,
                ContactPersonAddress = customer.ContactPersonAddress,
                GstOrTaxNumber = customer.GstOrTaxNumber,
                CreditLimit = customer.CreditLimit,
                OutstandingBalance = customer.OutstandingBalance,
                Notes = customer.Notes,
                IsActive = customer.IsActive
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

        var rentalHistoryItems = await (from rental in customerRentalsQuery
                                        join asset in assetsQuery on rental.AssetId equals asset.Id
                                        join invoice in _unitOfWork.Repository<Invoice>().Entities on rental.Id equals invoice.BookingId into invoiceGroup
                                        from inv in invoiceGroup.DefaultIfEmpty()
                                        orderby rental.StartDateTime descending
                                        select new
                                        {
                                            RentalId = rental.Id,
                                            InvoiceId = inv != null ? (Guid?)inv.Id : null,
                                            AssetName = asset.AssetName,
                                            StartDateTime = rental.StartDateTime,
                                            EndDateTime = rental.ActualEndDateTime ?? rental.ExpectedEndDateTime,
                                            Status = rental.Status,
                                            TotalBillAmount = inv != null ? inv.Total : (rental.TotalAmount ?? 0),
                                            PaidAmount = inv != null ? inv.AmountPaid : 0,
                                            BalanceAmount = inv != null ? inv.BalanceDue : (rental.TotalAmount ?? 0)
                                        })
            .Take(20)
            .ToListAsync(cancellationToken);

        customer.RentalHistory = rentalHistoryItems.Select(r => new CustomerRentalSummaryDto
        {
            RentalId = r.RentalId,
            InvoiceId = r.InvoiceId,
            RentalNo = "RENT-" + r.RentalId.ToString()[..8].ToUpper(),
            AssetName = r.AssetName,
            StartDateTime = r.StartDateTime,
            EndDateTime = r.EndDateTime,
            Status = r.Status,
            TotalBillAmount = r.TotalBillAmount,
            PaidAmount = r.PaidAmount,
            BalanceAmount = r.BalanceAmount
        }).ToList();

        return Result<CustomerDetailDto>.Success(customer);
    }
}

using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;

namespace CERMS.Application.Features.Customers.Commands;

public record UpdateCustomerCommand(
    Guid Id,
    CustomerType CustomerType,
    string CustomerName,
    string MobileNo,
    string? Address = null,
    string? AlternateMobileNo = null,
    string? Email = null,
    string? WhatsAppNo = null,
    string? City = null,
    string? State = null,
    string? Pincode = null,
    string? ContactPersonName = null,
    string? ContactPersonMobileNo = null,
    string? ContactPersonAddress = null,
    string? GstOrTaxNumber = null,
    decimal CreditLimit = 0,
    decimal OutstandingBalance = 0,
    string? Notes = null,
    bool IsActive = true) : IRequest<Result<CustomerDto>>;

public class UpdateCustomerHandler : IRequestHandler<UpdateCustomerCommand, Result<CustomerDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateCustomerHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<CustomerDto>> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(request.Id);
        if (customer == null)
            return Result<CustomerDto>.Failure("Customer not found.");

        customer.UpdateDetails(
            request.CustomerType,
            request.CustomerName.Trim(),
            request.MobileNo.Trim(),
            NormalizeOptionalValue(request.Address),
            NormalizeOptionalValue(request.AlternateMobileNo),
            NormalizeOptionalValue(request.Email),
            NormalizeOptionalValue(request.WhatsAppNo),
            NormalizeOptionalValue(request.City),
            NormalizeOptionalValue(request.State),
            NormalizeOptionalValue(request.Pincode),
            NormalizeOptionalValue(request.ContactPersonName),
            NormalizeOptionalValue(request.ContactPersonMobileNo),
            NormalizeOptionalValue(request.ContactPersonAddress),
            NormalizeOptionalValue(request.GstOrTaxNumber),
            request.CreditLimit,
            request.OutstandingBalance,
            NormalizeOptionalValue(request.Notes)
        );

        if (request.IsActive)
            customer.Activate();
        else
            customer.Deactivate();

        _unitOfWork.Repository<Customer>().Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerDto>.Success(_mapper.Map<CustomerDto>(customer));
    }

    private static string? NormalizeOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}

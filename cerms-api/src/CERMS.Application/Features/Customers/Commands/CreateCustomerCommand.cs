using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Customers.Commands;

public record CreateCustomerCommand(
    string Name,
    string Phone,
    string? Email = null,
    string? Address = null,
    string? CompanyName = null) : IRequest<Result<CustomerDto>>;

public class CreateCustomerHandler : IRequestHandler<CreateCustomerCommand, Result<CustomerDto>>
{
    private const string CustomerCodePrefix = "CUST-";

    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateCustomerHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<CustomerDto>> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customerCode = await GenerateCustomerCodeAsync(cancellationToken);

        var customer = new Customer(
            customerCode,
            request.Name.Trim(),
            request.Phone.Trim(),
            NormalizeOptionalValue(request.Email),
            NormalizeOptionalValue(request.Address),
            NormalizeOptionalValue(request.CompanyName));

        await _unitOfWork.Repository<Customer>().AddAsync(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerDto>.Success(_mapper.Map<CustomerDto>(customer));
    }

    private async Task<string> GenerateCustomerCodeAsync(CancellationToken cancellationToken)
    {
        var customerCodes = await _unitOfWork.Repository<Customer>().Entities
            .Where(customer => customer.CustomerCode.StartsWith(CustomerCodePrefix))
            .Select(customer => customer.CustomerCode)
            .ToListAsync(cancellationToken);

        var nextNumber = customerCodes
            .Select(GetCustomerCodeNumber)
            .DefaultIfEmpty(0)
            .Max() + 1;

        return $"{CustomerCodePrefix}{nextNumber:000}";
    }

    private static int GetCustomerCodeNumber(string customerCode)
    {
        var numberPart = customerCode[CustomerCodePrefix.Length..];
        return int.TryParse(numberPart, out var number) ? number : 0;
    }

    private static string? NormalizeOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}

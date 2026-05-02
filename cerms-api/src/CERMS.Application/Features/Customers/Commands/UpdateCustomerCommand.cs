using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;

namespace CERMS.Application.Features.Customers.Commands;

public record UpdateCustomerCommand(
    Guid Id,
    string Name,
    string Phone,
    string? Email = null,
    string? Address = null,
    string? CompanyName = null,
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
            request.Name.Trim(),
            request.Phone.Trim(),
            NormalizeOptionalValue(request.Email),
            NormalizeOptionalValue(request.Address),
            NormalizeOptionalValue(request.CompanyName),
            customer.IDProofNumber);

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

using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Customers.Queries;

public record GetCustomersQuery : IRequest<Result<PagedResult<CustomerDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public bool? IsActive { get; init; }
}

public class GetCustomersHandler : IRequestHandler<GetCustomersQuery, Result<PagedResult<CustomerDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetCustomersHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<CustomerDto>>> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<Customer>().Entities;

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.Trim().ToLower();
            query = query.Where(customer =>
                customer.Name.ToLower().Contains(searchTerm) ||
                customer.Phone.ToLower().Contains(searchTerm) ||
                customer.CustomerCode.ToLower().Contains(searchTerm));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(customer => customer.IsActive == request.IsActive.Value);
        }

        var count = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(customer => customer.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<CustomerDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var pagedResult = new PagedResult<CustomerDto>(items, count, request.PageNumber, request.PageSize);
        return Result<PagedResult<CustomerDto>>.Success(pagedResult);
    }
}

using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Invoices.Queries;

public record GetInvoicesQuery(int PageNumber = 1, int PageSize = 10) : IRequest<Result<PaginatedList<InvoiceDto>>>;

public class GetInvoicesHandler : IRequestHandler<GetInvoicesQuery, Result<PaginatedList<InvoiceDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetInvoicesHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedList<InvoiceDto>>> Handle(GetInvoicesQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<Invoice>().Entities;

        var count = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(i => i.IssuedDate)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<InvoiceDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<InvoiceDto>(items, count, request.PageNumber, request.PageSize);
        return Result<PaginatedList<InvoiceDto>>.Success(paginatedList);
    }
}

public record GetInvoiceByIdQuery(Guid Id) : IRequest<Result<InvoiceDto>>;

public class GetInvoiceByIdHandler : IRequestHandler<GetInvoiceByIdQuery, Result<InvoiceDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetInvoiceByIdHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<InvoiceDto>> Handle(GetInvoiceByIdQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().Entities
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

        if (invoice == null) return Result<InvoiceDto>.Failure("Invoice not found.");

        return Result<InvoiceDto>.Success(_mapper.Map<InvoiceDto>(invoice));
    }
}

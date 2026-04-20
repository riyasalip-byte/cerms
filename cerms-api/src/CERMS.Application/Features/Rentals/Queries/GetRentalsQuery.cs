using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Rentals.Queries;

public record GetRentalsQuery(int PageNumber = 1, int PageSize = 10) : IRequest<Result<PaginatedList<RentalDto>>>;

public class GetRentalsHandler : IRequestHandler<GetRentalsQuery, Result<PaginatedList<RentalDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetRentalsHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedList<RentalDto>>> Handle(GetRentalsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<RentalBooking>().Entities;

        var count = await query.CountAsync(cancellationToken);
        var items = await query
            .Include(r => r.AssetId) // Not really how Include works for IDs, I need the entities
            .OrderByDescending(r => r.BookingDate)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<RentalDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<RentalDto>(items, count, request.PageNumber, request.PageSize);
        return Result<PaginatedList<RentalDto>>.Success(paginatedList);
    }
}

public record GetRentalByIdQuery(Guid Id) : IRequest<Result<RentalDto>>;

public class GetRentalByIdHandler : IRequestHandler<GetRentalByIdQuery, Result<RentalDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetRentalByIdHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<RentalDto>> Handle(GetRentalByIdQuery request, CancellationToken cancellationToken)
    {
        var rental = await _unitOfWork.Repository<RentalBooking>().Entities
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (rental == null) return Result<RentalDto>.Failure("Rental not found.");

        return Result<RentalDto>.Success(_mapper.Map<RentalDto>(rental));
    }
}

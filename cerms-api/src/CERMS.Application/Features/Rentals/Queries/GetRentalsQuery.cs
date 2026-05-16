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
        var rentalsQuery = _unitOfWork.Repository<RentalBooking>().Entities;
        var assetsQuery = _unitOfWork.Repository<Asset>().Entities;
        var customersQuery = _unitOfWork.Repository<Customer>().Entities;

        var count = await rentalsQuery.CountAsync(cancellationToken);
        
        var query = from r in rentalsQuery
                    join a in assetsQuery on r.AssetId equals a.Id
                    join c in customersQuery on r.CustomerId equals c.Id
                    orderby r.StartDateTime descending
                    select new RentalDto
                    {
                        Id = r.Id,
                        AssetId = r.AssetId,
                        AssetName = a.AssetName,
                        CustomerId = r.CustomerId,
                        CustomerName = c.Name,
                        Status = r.Status,
                        StartDateTime = r.StartDateTime,
                        ExpectedEndDateTime = r.ExpectedEndDateTime,
                        ActualEndDateTime = r.ActualEndDateTime,
                        RateType = r.RateType,
                        RateAmount = r.RateAmount,
                        StartOdometer = r.StartOdometer,
                        EndOdometer = r.EndOdometer,
                        TotalAmount = r.TotalAmount,
                        IsInvoiced = r.IsInvoiced
                    };

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
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
        var rentalsQuery = _unitOfWork.Repository<RentalBooking>().Entities;
        var assetsQuery = _unitOfWork.Repository<Asset>().Entities;
        var customersQuery = _unitOfWork.Repository<Customer>().Entities;

        var rentalDto = await (from r in rentalsQuery
                               join a in assetsQuery on r.AssetId equals a.Id
                               join c in customersQuery on r.CustomerId equals c.Id
                               where r.Id == request.Id
                               select new RentalDto
                               {
                                   Id = r.Id,
                                   AssetId = r.AssetId,
                                   AssetName = a.AssetName,
                                   CustomerId = r.CustomerId,
                                   CustomerName = c.Name,
                                   Status = r.Status,
                                   StartDateTime = r.StartDateTime,
                                   ExpectedEndDateTime = r.ExpectedEndDateTime,
                                   ActualEndDateTime = r.ActualEndDateTime,
                                   RateType = r.RateType,
                                   RateAmount = r.RateAmount,
                                   StartOdometer = r.StartOdometer,
                                   EndOdometer = r.EndOdometer,
                                   TotalAmount = r.TotalAmount,
                                   IsInvoiced = r.IsInvoiced
                               }).FirstOrDefaultAsync(cancellationToken);

        if (rentalDto == null) return Result<RentalDto>.Failure("Rental not found.");

        return Result<RentalDto>.Success(rentalDto);
    }
}

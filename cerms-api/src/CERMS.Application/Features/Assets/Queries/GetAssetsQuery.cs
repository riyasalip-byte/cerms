using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Assets.Queries;

public record GetAssetsQuery : IRequest<Result<PaginatedList<AssetDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public AssetStatus? Status { get; init; }
    public string? AssetType { get; init; }
}

public class GetAssetsHandler : IRequestHandler<GetAssetsQuery, Result<PaginatedList<AssetDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAssetsHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedList<AssetDto>>> Handle(GetAssetsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<Asset>().Entities;

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status);
        }

        if (!string.IsNullOrEmpty(request.AssetType))
        {
            query = query.Where(x => x.AssetType == request.AssetType);
        }

        var count = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<AssetDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<AssetDto>(items, count, request.PageNumber, request.PageSize);
        return Result<PaginatedList<AssetDto>>.Success(paginatedList);
    }
}

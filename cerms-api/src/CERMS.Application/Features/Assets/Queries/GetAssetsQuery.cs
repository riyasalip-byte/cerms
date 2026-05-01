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

public record GetAssetsQuery : IRequest<Result<PagedResult<AssetDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public AssetStatus? Status { get; init; }
    public string? AssetType { get; init; }
}

public class GetAssetsHandler : IRequestHandler<GetAssetsQuery, Result<PagedResult<AssetDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAssetsHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<AssetDto>>> Handle(GetAssetsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<Asset>().Entities;

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(searchTerm) || x.AssetCode.ToLower().Contains(searchTerm));
        }

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
            .OrderByDescending(x => x.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<AssetDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var pagedResult = new PagedResult<AssetDto>(items, count, request.PageNumber, request.PageSize);
        return Result<PagedResult<AssetDto>>.Success(pagedResult);
    }
}

using StaffEntity = CERMS.Domain.Entities.Staff;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Staff.Queries;

public record GetAssetClassesQuery : IRequest<Result<List<AssetClassDto>>>;

public class GetAssetClassesHandler : IRequestHandler<GetAssetClassesQuery, Result<List<AssetClassDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAssetClassesHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<List<AssetClassDto>>> Handle(GetAssetClassesQuery request, CancellationToken cancellationToken)
    {
        var items = await _unitOfWork.Repository<AssetClass>().Entities
            .Where(a => a.IsActive)
            .OrderBy(a => a.Name)
            .ProjectTo<AssetClassDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<List<AssetClassDto>>.Success(items);
    }
}

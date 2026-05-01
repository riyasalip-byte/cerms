using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Assets.Queries;

public record GetAssetByIdQuery(Guid Id) : IRequest<Result<AssetDetailDto>>;

public class GetAssetByIdHandler : IRequestHandler<GetAssetByIdQuery, Result<AssetDetailDto>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IMapper _mapper;

    public GetAssetByIdHandler(IAssetRepository assetRepository, IMapper mapper)
    {
        _assetRepository = assetRepository;
        _mapper = mapper;
    }

    public async Task<Result<AssetDetailDto>> Handle(GetAssetByIdQuery request, CancellationToken cancellationToken)
    {
        var dto = await _assetRepository.Entities
            .Where(a => a.Id == request.Id)
            .ProjectTo<AssetDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        if (dto == null)
            return Result<AssetDetailDto>.Failure("Asset not found.");

        return Result<AssetDetailDto>.Success(dto);
    }
}

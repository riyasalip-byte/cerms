using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;

namespace CERMS.Application.Features.Assets.Queries;

public record GetAssetsQuery : IRequest<Result<IReadOnlyList<AssetDto>>>;

public class GetAssetsHandler : IRequestHandler<GetAssetsQuery, Result<IReadOnlyList<AssetDto>>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IMapper _mapper;

    public GetAssetsHandler(IAssetRepository assetRepository, IMapper mapper)
    {
        _assetRepository = assetRepository;
        _mapper = mapper;
    }

    public async Task<Result<IReadOnlyList<AssetDto>>> Handle(GetAssetsQuery request, CancellationToken cancellationToken)
    {
        var assets = await _assetRepository.GetAllAsync();
        var dtos = _mapper.Map<IReadOnlyList<AssetDto>>(assets);
        return Result<IReadOnlyList<AssetDto>>.Success(dtos);
    }
}

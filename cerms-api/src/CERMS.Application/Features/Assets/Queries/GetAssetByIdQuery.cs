using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using MediatR;

namespace CERMS.Application.Features.Assets.Queries;

public record GetAssetByIdQuery(Guid Id) : IRequest<Result<AssetDto>>;

public class GetAssetByIdHandler : IRequestHandler<GetAssetByIdQuery, Result<AssetDto>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IMapper _mapper;

    public GetAssetByIdHandler(IAssetRepository assetRepository, IMapper mapper)
    {
        _assetRepository = assetRepository;
        _mapper = mapper;
    }

    public async Task<Result<AssetDto>> Handle(GetAssetByIdQuery request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Id);
        if (asset == null)
            return Result<AssetDto>.Failure("Asset not found.");

        var dto = _mapper.Map<AssetDto>(asset);
        return Result<AssetDto>.Success(dto);
    }
}

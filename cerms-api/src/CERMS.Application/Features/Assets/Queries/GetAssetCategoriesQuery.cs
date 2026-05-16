using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Assets.Queries;

public record AssetCategoryDto(Guid Id, string Name, bool IsTransportationRequiredByDefault);

public record GetAssetCategoriesQuery : IRequest<Result<List<AssetCategoryDto>>>;

public class GetAssetCategoriesHandler : IRequestHandler<GetAssetCategoriesQuery, Result<List<AssetCategoryDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAssetCategoriesHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<AssetCategoryDto>>> Handle(GetAssetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _unitOfWork.Repository<AssetCategory>().Entities
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(c => !c.IsDeleted && c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new AssetCategoryDto(c.Id, c.Name, c.IsTransportationRequiredByDefault))
            .ToListAsync(cancellationToken);

        return Result<List<AssetCategoryDto>>.Success(categories);
    }
}

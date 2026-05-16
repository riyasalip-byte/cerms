using CERMS.Application.Features.Assets.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

[Authorize]
[Route("api/v1/asset-categories")]
public class AssetCategoriesController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAssetCategories()
    {
        var query = new GetAssetCategoriesQuery();
        var result = await Mediator.Send(query);
        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { result.Error ?? "An error occurred." } });
    }
}

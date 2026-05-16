using CERMS.Application.Features.Assets.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

[Authorize]
[Route("api/v1/maintenance-types")]
public class MaintenanceTypesController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMaintenanceTypes()
    {
        var result = await Mediator.Send(new GetMaintenanceTypesQuery());
        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { result.Error ?? "An error occurred." } });
    }
}

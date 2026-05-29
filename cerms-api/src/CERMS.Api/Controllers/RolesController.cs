using CERMS.Application.Features.Staff.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

[Authorize]
public class RolesController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return HandleResult(await Mediator.Send(new GetRolesQuery()));
    }
}

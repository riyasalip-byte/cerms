using CERMS.Application.Common;
using CERMS.Application.Features.Users.Commands.ChangePassword;
using CERMS.Application.Features.Users.Commands.UpdateProfile;
using CERMS.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/me")]
public class ProfileController : ControllerBase
{
    private ISender? _mediator;
    private ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    private ActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
            return Ok(new ApiResponse<T> { Success = true, Data = result.Value });

        return BadRequest(new ApiResponse<T> { Success = false, Errors = new[] { result.Error ?? "An error occurred." } });
    }

    private ActionResult HandleResult(Result result)
    {
        if (result.IsSuccess)
            return Ok(new ApiResponse<object> { Success = true });

        return BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { result.Error ?? "An error occurred." } });
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return HandleResult(await Mediator.Send(new GetMyProfileQuery()));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileCommand command)
    {
        return HandleResult(await Mediator.Send(command));
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        return HandleResult(await Mediator.Send(command));
    }
}

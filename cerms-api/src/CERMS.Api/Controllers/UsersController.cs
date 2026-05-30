using CERMS.Application.Features.Users.Commands.CreateUser;
using CERMS.Application.Features.Users.Commands.ResetPassword;
using CERMS.Application.Features.Users.Commands.UpdateUser;
using CERMS.Application.Features.Users.Queries;
using CERMS.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CERMS.Api.Controllers;

[Authorize]
[Route("api/v1/users")]
public class UsersController : ApiControllerBase
{
    [HttpGet]
    [AuthorizePermission("Users.View")]
    public async Task<IActionResult> Get(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? roleName = null,
        [FromQuery] string? searchTerm = null)
    {
        return HandleResult(await Mediator.Send(new GetUsersQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            RoleName = roleName,
            SearchTerm = searchTerm
        }));
    }

    [HttpGet("{id}")]
    [AuthorizePermission("Users.View")]
    public async Task<IActionResult> GetById(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetUserByIdQuery(id)));
    }

    [HttpPost]
    [AuthorizePermission("Users.Create")]
    public async Task<IActionResult> Create([FromBody] CreateUserCommand command)
    {
        return HandleResult(await Mediator.Send(command));
    }

    [HttpPut("{id}")]
    [AuthorizePermission("Users.Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserCommand command)
    {
        if (id != command.Id)
            return BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { "ID mismatch" } });

        return HandleResult(await Mediator.Send(command));
    }

    [HttpPost("{id}/reset-password")]
    [AuthorizePermission("Users.ResetPassword")]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
    {
        return HandleResult(await Mediator.Send(new ResetPasswordCommand(id, request.NewPassword)));
    }
}

public class ResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

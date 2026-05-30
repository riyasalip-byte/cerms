using CERMS.Application.Features.Roles.Commands.AssignPermissions;
using CERMS.Application.Features.Roles.Commands.CreateRole;
using CERMS.Application.Features.Roles.Commands.UpdateRole;
using CERMS.Application.Features.Roles.Queries.GetPermissions;
using CERMS.Application.Features.Roles.Queries.GetRoleById;
using CERMS.Application.Features.Roles.Queries.GetRoles;
using CERMS.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CERMS.Api.Controllers;

[Authorize]
public class RolesController : ApiControllerBase
{
    [HttpGet]
    [AuthorizePermission("Roles.View")]
    public async Task<IActionResult> Get([FromQuery] bool? onlyActive)
    {
        return HandleResult(await Mediator.Send(new GetRolesQuery { OnlyActive = onlyActive }));
    }

    [HttpGet("{id}")]
    [AuthorizePermission("Roles.View")]
    public async Task<IActionResult> GetById(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetRoleByIdQuery { Id = id }));
    }

    [HttpPost]
    [AuthorizePermission("Roles.Create")]
    public async Task<IActionResult> Create([FromBody] CreateRoleCommand command)
    {
        return HandleResult(await Mediator.Send(command));
    }

    [HttpPut("{id}")]
    [AuthorizePermission("Roles.Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { "ID mismatch" } });
        }
        return HandleResult(await Mediator.Send(command));
    }

    [HttpPost("{id}/permissions")]
    [AuthorizePermission("Roles.Edit")]
    public async Task<IActionResult> AssignPermissions(Guid id, [FromBody] AssignPermissionsRequest request)
    {
        return HandleResult(await Mediator.Send(new AssignPermissionsCommand 
        { 
            RoleId = id, 
            PermissionIds = request.PermissionIds 
        }));
    }

    [HttpGet("~/api/v1/permissions")]
    [AuthorizePermission("Roles.View")]
    public async Task<IActionResult> GetPermissions()
    {
        return HandleResult(await Mediator.Send(new GetPermissionsQuery()));
    }
}

public class AssignPermissionsRequest
{
    public List<Guid> PermissionIds { get; set; } = new();
}

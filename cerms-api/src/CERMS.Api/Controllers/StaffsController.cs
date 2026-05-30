using CERMS.Application.Features.Staff.Commands;
using CERMS.Application.Features.Staff.Queries;
using CERMS.Domain.Enums;
using CERMS.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CERMS.Api.Controllers;

[Authorize]
[Route("api/v1/staffs")]
public class StaffsController : ApiControllerBase
{
    [HttpGet]
    [AuthorizePermission("Staff.View")]
    public async Task<IActionResult> Get(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] EmployeeCategory? employeeCategory = null,
        [FromQuery] EmploymentStatus? employmentStatus = null)
    {
        return HandleResult(await Mediator.Send(new GetStaffsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            EmployeeCategory = employeeCategory,
            EmploymentStatus = employmentStatus
        }));
    }

    [HttpGet("insights")]
    [AuthorizePermission("Staff.View")]
    public async Task<IActionResult> GetInsights()
    {
        return HandleResult(await Mediator.Send(new GetStaffInsightsQuery()));
    }

    [HttpGet("without-user")]
    [AuthorizePermission("Staff.View")]
    public async Task<IActionResult> GetWithoutUser()
    {
        return HandleResult(await Mediator.Send(new GetStaffWithoutUserQuery()));
    }

    [HttpGet("asset-classes")]
    [AuthorizePermission("Staff.View")]
    public async Task<IActionResult> GetAssetClasses()
    {
        return HandleResult(await Mediator.Send(new GetAssetClassesQuery()));
    }

    [HttpGet("{id}")]
    [AuthorizePermission("Staff.View")]
    public async Task<IActionResult> GetById(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetStaffByIdQuery(id)));
    }

    [HttpPost]
    [AuthorizePermission("Staff.Create")]
    public async Task<IActionResult> Create([FromBody] CreateStaffCommand command)
    {
        return HandleResult(await Mediator.Send(command));
    }

    [HttpPut("{id}")]
    [AuthorizePermission("Staff.Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaffCommand command)
    {
        if (id != command.Id)
            return BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { "ID mismatch" } });

        return HandleResult(await Mediator.Send(command));
    }

    [HttpPost("{id}/deactivate")]
    [AuthorizePermission("Staff.Edit")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        return HandleResult(await Mediator.Send(new DeactivateStaffCommand(id)));
    }
}

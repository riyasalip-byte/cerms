using CERMS.Application.Features.Users.Commands.InviteUser;
using CERMS.Application.Features.Users.Queries;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] UserRole? role = null)
    {
        var result = await _mediator.Send(new GetUsersQuery 
        { 
            PageNumber = pageNumber, 
            PageSize = pageSize, 
            Role = role 
        });
        
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("invite")]
    public async Task<IActionResult> Invite([FromBody] InviteUserCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}

using CERMS.Application.Features.Customers.Commands;
using CERMS.Application.Features.Customers.Queries;
using CERMS.Domain.Enums;
using CERMS.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CERMS.Api.Controllers;

[Authorize]
public class CustomersController : ApiControllerBase
{
    [HttpGet]
    [AuthorizePermission("Customer.View")]
    public async Task<IActionResult> Get(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10, 
        [FromQuery] string? searchTerm = null, 
        [FromQuery] bool? isActive = null,
        [FromQuery] CustomerType? customerType = null)
    {
        var query = new GetCustomersQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            IsActive = isActive,
            CustomerType = customerType
        };

        return HandleResult(await Mediator.Send(query));
    }

    [HttpGet("{id}")]
    [AuthorizePermission("Customer.View")]
    public async Task<IActionResult> GetById(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetCustomerByIdQuery(id)));
    }

    [HttpPost]
    [AuthorizePermission("Customer.Create")]
    public async Task<IActionResult> Create([FromBody] CreateCustomerCommand command)
    {
        return HandleResult(await Mediator.Send(command));
    }

    [HttpPut("{id}")]
    [AuthorizePermission("Customer.Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerCommand command)
    {
        if (id != command.Id)
            return BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { "ID mismatch" } });

        return HandleResult(await Mediator.Send(command));
    }

    [HttpPost("{id}/deactivate")]
    [AuthorizePermission("Customer.Edit")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        return HandleResult(await Mediator.Send(new DeactivateCustomerCommand(id)));
    }
}

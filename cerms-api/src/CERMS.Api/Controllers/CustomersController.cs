using CERMS.Application.Features.Customers.Commands;
using CERMS.Application.Features.Customers.Queries;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

public class CustomersController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null, [FromQuery] bool? isActive = null)
    {
        var query = new GetCustomersQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            IsActive = isActive
        };

        return HandleResult(await Mediator.Send(query));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetCustomerByIdQuery(id)));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomerCommand command)
    {
        return HandleResult(await Mediator.Send(command));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerCommand command)
    {
        if (id != command.Id)
            return BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { "ID mismatch" } });

        return HandleResult(await Mediator.Send(command));
    }

    [HttpPost("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        return HandleResult(await Mediator.Send(new DeactivateCustomerCommand(id)));
    }
}

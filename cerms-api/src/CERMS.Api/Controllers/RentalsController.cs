using CERMS.Application.Features.Rentals.Commands.CloseRental;
using CERMS.Application.Features.Rentals.Commands.CreateRental;
using CERMS.Application.Features.Rentals.Commands.ExtendRental;
using CERMS.Application.Features.Rentals.Commands.UpdateRental;
using CERMS.Application.Features.Rentals.Queries;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

[ApiController]
[Route("api/v1/rentals")]
public class RentalsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RentalsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetRentalsQuery(pageNumber, pageSize));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetRentalByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRentalCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value) : BadRequest(result.Error);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] RentalStatus status)
    {
        var result = await _mediator.Send(new UpdateRentalCommand(id, status));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id}/close")]
    public async Task<IActionResult> Close(Guid id, [FromBody] CloseRentalRequest request)
    {
        var result = await _mediator.Send(new CloseRentalCommand(id, request.ActualEndDate, request.CurrentOdometer));
        return result.IsSuccess ? Ok(new { InvoiceId = result.Value }) : BadRequest(result.Error);
    }

    public class CloseRentalRequest
    {
        public DateTime ActualEndDate { get; set; }
        public decimal? CurrentOdometer { get; set; }
    }

    [HttpPost("{id}/extend")]
    public async Task<IActionResult> Extend(Guid id, [FromBody] DateTime newExpectedEndDate)
    {
        var result = await _mediator.Send(new ExtendRentalCommand(id, newExpectedEndDate));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}

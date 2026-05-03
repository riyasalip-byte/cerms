using CERMS.Application.Features.Rentals.Commands.CloseRental;
using CERMS.Application.Features.Rentals.Commands.ConfirmRental;
using CERMS.Application.Features.Rentals.Commands.CreateRental;
using CERMS.Application.Features.Rentals.Commands.StartRental;
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
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetRentalByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRentalCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess) return BadRequest(new { error = result.Error });
        
        return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(Guid id)
    {
        var result = await _mediator.Send(new ConfirmRentalCommand(id));
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/start")]
    public async Task<IActionResult> Start(Guid id, [FromBody] StartRentalRequest request)
    {
        var result = await _mediator.Send(new StartRentalCommand(id, request.StartOdometer));
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/close")]
    public async Task<IActionResult> Close(Guid id, [FromBody] CloseRentalRequest request)
    {
        var result = await _mediator.Send(new CloseRentalCommand(
            id,
            request.EndOdometer,
            request.ActualEndDateTime,
            request.BillingMode,
            request.RateType,
            request.RateAmount,
            request.OverrideTotalAmount));

        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    public class StartRentalRequest
    {
        public decimal StartOdometer { get; set; }
    }

    public class CloseRentalRequest
    {
        public decimal EndOdometer { get; set; }
        public DateTime ActualEndDateTime { get; set; }
        public BillingMode BillingMode { get; set; } = BillingMode.Auto;
        public RateType? RateType { get; set; }
        public decimal? RateAmount { get; set; }
        public decimal? OverrideTotalAmount { get; set; }
    }
}

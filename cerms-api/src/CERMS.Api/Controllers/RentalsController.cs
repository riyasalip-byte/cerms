using CERMS.Application.Features.Rentals.Commands.CloseRental;
using CERMS.Application.Features.Rentals.Commands.ConfirmRental;
using CERMS.Application.Features.Rentals.Commands.CreateRental;
using CERMS.Application.Features.Rentals.Commands.StartRental;
using CERMS.Application.Features.Rentals.Commands.DispatchRental;
using CERMS.Application.Features.Rentals.Commands.CancelRental;
using CERMS.Application.Features.Rentals.Commands.CompleteRental;
using CERMS.Application.Features.Rentals.Commands.UpdateRental;
using CERMS.Application.Features.Assignments.Commands.AssignOperator;
using CERMS.Application.Features.Rentals.Queries;
using CERMS.Domain.Enums;
using CERMS.Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CERMS.Api.Controllers;

[Authorize]
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
    [AuthorizePermission("Rental.View")]
    public async Task<IActionResult> Get([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetRentalsQuery(pageNumber, pageSize));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("{id}")]
    [AuthorizePermission("Rental.View")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetRentalByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpPost]
    [AuthorizePermission("Rental.Create")]
    public async Task<IActionResult> Create([FromBody] CreateRentalCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess) return BadRequest(new { error = result.Error });
        
        return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id}")]
    [AuthorizePermission("Rental.Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRentalRequest request)
    {
        var result = await _mediator.Send(new UpdateRentalCommand(
            id,
            request.StartDateTime,
            request.ExpectedEndDateTime,
            request.RateType,
            request.RateAmount,
            request.SiteName,
            request.SiteAddress,
            request.SiteLandmark,
            request.SiteContactPerson,
            request.SiteContactNumber,
            request.PickupTransportCharge,
            request.ReturnTransportCharge,
            request.TransportNotes,
            request.AdvanceAmount,
            request.SecurityDepositAmount,
            request.FuelResponsibilityType
        ));

        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/confirm")]
    [AuthorizePermission("Rental.Edit")]
    public async Task<IActionResult> Confirm(Guid id)
    {
        var result = await _mediator.Send(new ConfirmRentalCommand(id));
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/dispatch")]
    [AuthorizePermission("Rental.Edit")]
    public async Task<IActionResult> Dispatch(Guid id)
    {
        var result = await _mediator.Send(new DispatchRentalCommand(id));
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/cancel")]
    [AuthorizePermission("Rental.Edit")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var result = await _mediator.Send(new CancelRentalCommand(id));
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/start")]
    [AuthorizePermission("Rental.Start")]
    public async Task<IActionResult> Start(Guid id, [FromBody] StartRentalRequest request)
    {
        var result = await _mediator.Send(new StartRentalCommand(id, request.StartOdometer));
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/complete")]
    [AuthorizePermission("Rental.Complete")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] CompleteRentalRequest request)
    {
        var result = await _mediator.Send(new CompleteRentalCommand(
            id,
            request.EndOdometer,
            request.ActualEndDateTime,
            request.BillingMode,
            request.RateType,
            request.RateAmount,
            request.OverrideTotalAmount));

        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/close")]
    [AuthorizePermission("Rental.Close")]
    public async Task<IActionResult> Close(Guid id)
    {
        var result = await _mediator.Send(new CloseRentalCommand(id));
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/assign-operator")]
    [AuthorizePermission("Rental.Edit")]
    public async Task<IActionResult> AssignOperator(Guid id, [FromBody] AssignOperatorRequest request)
    {
        var result = await _mediator.Send(new AssignOperatorCommand(id, request.OperatorId));
        return result.IsSuccess ? Ok(new { id = result.Value }) : BadRequest(new { error = result.Error });
    }

    public class AssignOperatorRequest
    {
        public Guid OperatorId { get; set; }
    }

    public class UpdateRentalRequest
    {
        public DateTime StartDateTime { get; set; }
        public DateTime ExpectedEndDateTime { get; set; }
        public RateType? RateType { get; set; }
        public decimal? RateAmount { get; set; }
        public string SiteName { get; set; } = string.Empty;
        public string SiteAddress { get; set; } = string.Empty;
        public string? SiteLandmark { get; set; }
        public string? SiteContactPerson { get; set; }
        public string? SiteContactNumber { get; set; }
        public decimal? PickupTransportCharge { get; set; }
        public decimal? ReturnTransportCharge { get; set; }
        public string? TransportNotes { get; set; }
        public decimal? AdvanceAmount { get; set; }
        public decimal? SecurityDepositAmount { get; set; }
        public FuelResponsibilityType FuelResponsibilityType { get; set; }
    }

    public class StartRentalRequest
    {
        public decimal StartOdometer { get; set; }
    }

    public class CompleteRentalRequest
    {
        public decimal EndOdometer { get; set; }
        public DateTime ActualEndDateTime { get; set; }
        public BillingMode BillingMode { get; set; } = BillingMode.Auto;
        public RateType? RateType { get; set; }
        public decimal? RateAmount { get; set; }
        public decimal? OverrideTotalAmount { get; set; }
    }
}

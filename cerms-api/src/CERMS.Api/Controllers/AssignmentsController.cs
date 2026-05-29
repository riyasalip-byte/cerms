using CERMS.Application.Features.Assignments.Commands.AcceptAssignment;
using CERMS.Application.Features.Assignments.Commands.OperatorCompleteRental;
using CERMS.Application.Features.Assignments.Commands.OperatorGenerateInvoice;
using CERMS.Application.Features.Assignments.Commands.OperatorStartRental;
using CERMS.Application.Features.Assignments.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CERMS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/assignments")]
public class AssignmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AssignmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("operators")]
    public async Task<IActionResult> GetOperators()
    {
        var result = await _mediator.Send(new GetOperatorsQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("my-assignments")]
    [HttpGet("/api/v1/operator/my-assignments")]
    public async Task<IActionResult> GetMyAssignments()
    {
        var result = await _mediator.Send(new GetOperatorAssignmentsQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/accept")]
    public async Task<IActionResult> Accept(Guid id)
    {
        var result = await _mediator.Send(new AcceptAssignmentCommand(id));
        return result.IsSuccess ? Ok(new { id = result.Value }) : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/start")]
    public async Task<IActionResult> Start(Guid id, [FromBody] OperatorStartRentalRequest request)
    {
        var result = await _mediator.Send(new OperatorStartRentalCommand(
            id,
            request.StartMeterReading,
            request.Remarks,
            request.ActualStartDateTime ?? DateTime.UtcNow
        ));
        return result.IsSuccess ? Ok(new { id = result.Value }) : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] OperatorCompleteRentalRequest request)
    {
        var result = await _mediator.Send(new OperatorCompleteRentalCommand(
            id,
            request.EndMeterReading,
            request.Remarks,
            request.ActualEndDateTime ?? DateTime.UtcNow
        ));
        return result.IsSuccess ? Ok(new { id = result.Value }) : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id}/generate-invoice")]
    public async Task<IActionResult> GenerateInvoice(Guid id)
    {
        var result = await _mediator.Send(new OperatorGenerateInvoiceCommand(id));
        return result.IsSuccess ? Ok(new { id = result.Value }) : BadRequest(new { error = result.Error });
    }
}

public class OperatorStartRentalRequest
{
    public decimal StartMeterReading { get; set; }
    public string? Remarks { get; set; }
    public DateTime? ActualStartDateTime { get; set; }
}

public class OperatorCompleteRentalRequest
{
    public decimal EndMeterReading { get; set; }
    public string? Remarks { get; set; }
    public DateTime? ActualEndDateTime { get; set; }
}

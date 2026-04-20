using CERMS.Application.Features.Invoices.Commands.RecordPayment;
using CERMS.Application.Features.Invoices.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

[ApiController]
[Route("api/v1/invoices")]
public class InvoicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public InvoicesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetInvoicesQuery(pageNumber, pageSize));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetInvoiceByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpPost("{id}/payments")]
    public async Task<IActionResult> RecordPayment(Guid id, [FromBody] decimal amount)
    {
        var result = await _mediator.Send(new RecordPaymentCommand(id, amount));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpGet("{id}/pdf-stub")]
    public IActionResult GetPdfStub(Guid id)
    {
        // Stub PDF generation
        return Ok(new { Message = $"PDF generation for invoice {id} is not implemented yet.", DownloadUrl = $"/api/v1/invoices/{id}/pdf-stub/download" });
    }
}

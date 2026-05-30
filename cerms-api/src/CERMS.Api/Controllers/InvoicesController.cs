using CERMS.Application.Interfaces;
using CERMS.Application.Features.Invoices.Queries;
using CERMS.Domain.Entities;
using CERMS.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;

namespace CERMS.Api.Controllers;

[Authorize]
[Route("api/v1/[controller]")]
public class InvoicesController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;

    public InvoicesController(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
    }

    [HttpGet]
    [AuthorizePermission("Invoice.View")]
    public async Task<IActionResult> GetInvoices([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await Mediator.Send(new GetInvoicesQuery(pageNumber, pageSize));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("{id}")]
    [AuthorizePermission("Invoice.View")]
    public async Task<IActionResult> GetInvoiceById(Guid id)
    {
        var result = await Mediator.Send(new GetInvoiceByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpGet("{id}/pdf")]
    [AuthorizePermission("Invoice.View")]
    public async Task<IActionResult> GetInvoicePdf(Guid id)
    {
        var invoice = await _unitOfWork.Repository<Invoice>()
            .Entities
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            return NotFound("Invoice not found.");
        }

        if (string.IsNullOrEmpty(invoice.PdfUrl))
        {
            return BadRequest("Invoice PDF not generated yet.");
        }

        try
        {
            var pdfBytes = await _fileStorageService.GetFileAsync(invoice.PdfUrl);
            return File(pdfBytes, "application/pdf", $"{invoice.InvoiceNumber}.pdf");
        }
        catch (FileNotFoundException)
        {
            return NotFound("Invoice PDF file not found on storage.");
        }
    }
}

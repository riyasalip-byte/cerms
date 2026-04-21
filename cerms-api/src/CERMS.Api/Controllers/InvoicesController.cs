using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Api.Controllers;

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

    [HttpGet("{id}/pdf")]
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

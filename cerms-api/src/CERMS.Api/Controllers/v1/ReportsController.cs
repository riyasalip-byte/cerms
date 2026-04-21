using CERMS.Application.Features.Reports.Queries.GetMaintenanceCostReport;
using CERMS.Application.Features.Reports.Queries.GetPayrollReport;
using CERMS.Application.Features.Reports.Queries.GetRevenueReport;
using CERMS.Application.Features.Reports.Queries.GetUtilisationReport;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class ReportsController : ApiControllerBase
{
    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenueReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var result = await Mediator.Send(new GetRevenueReportQuery(startDate, endDate));
        return Ok(new ApiResponse<RevenueReportDto> { Success = true, Data = result });
    }

    [HttpGet("utilisation")]
    public async Task<IActionResult> GetUtilisationReport()
    {
        var result = await Mediator.Send(new GetUtilisationReportQuery());
        return Ok(new ApiResponse<object> { Success = true, Data = result });
    }

    [HttpGet("maintenance-cost")]
    public async Task<IActionResult> GetMaintenanceCostReport()
    {
        var result = await Mediator.Send(new GetMaintenanceCostReportQuery());
        return Ok(new ApiResponse<object> { Success = true, Data = result });
    }

    [HttpGet("payroll")]
    public async Task<IActionResult> GetPayrollReport()
    {
        var result = await Mediator.Send(new GetPayrollReportQuery());
        return Ok(new ApiResponse<object> { Success = true, Data = result });
    }
}

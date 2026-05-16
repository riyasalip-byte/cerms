using CERMS.Api.Contracts.Assets;
using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Features.Assets.Queries;
using CERMS.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

public class AssetsController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null, [FromQuery] AssetStatus? status = null, [FromQuery] Guid? assetCategoryId = null)
    {
        var query = new GetAssetsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Status = status,
            AssetCategoryId = assetCategoryId
        };
        return HandleResult(await Mediator.Send(query));
    }

    [HttpGet("expiring")]
    public async Task<IActionResult> GetExpiring([FromQuery] int days = 30)
    {
        return HandleResult(await Mediator.Send(new GetExpiringAssetsQuery(days)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetAssetByIdQuery(id)));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssetRequest request)
    {
        return HandleResult(await Mediator.Send(request.ToCommand()));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAssetRequest request)
    {
        var command = request.ToCommand(id);
        if (id != command.Id)
            return BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { "ID mismatch" } });

        return HandleResult(await Mediator.Send(command));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        return HandleResult(await Mediator.Send(new DeleteAssetCommand(id)));
    }

    [HttpPost("{id}/maintenance")]
    public async Task<IActionResult> AddMaintenance(Guid id, [FromBody] AddMaintenanceCommand command)
    {
        if (id != command.AssetId)
            return BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { "ID mismatch" } });

        return HandleResult(await Mediator.Send(command));
    }

    [HttpPost("{id}/maintenance/complete")]
    public async Task<IActionResult> CompleteMaintenance(Guid id, [FromBody] CERMS.Application.DTOs.CompleteMaintenanceDto dto)
    {
        return HandleResult(await Mediator.Send(new CompleteMaintenanceCommand(id, dto.MaintenanceId, dto.FinalCost, dto.Notes, dto.ServiceDate)));
    }
}

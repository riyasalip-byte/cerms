using CERMS.Application.DTOs;
using CERMS.Application.Features.Assets.Commands;
using CERMS.Application.Features.Assets.Queries;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

public class AssetsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AssetDto>>>> GetAll()
    {
        return HandleResult(await Mediator.Send(new GetAssetsQuery()));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AssetDto>>> GetById(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetAssetByIdQuery(id)));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create(CreateAssetCommand command)
    {
        return HandleResult(await Mediator.Send(command));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(Guid id, UpdateAssetCommand command)
    {
        if (id != command.Id)
            return BadRequest(new ApiResponse<object> { Success = false, Errors = new[] { "ID mismatch" } });

        return HandleResult(await Mediator.Send(command));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        return HandleResult(await Mediator.Send(new DeleteAssetCommand(id)));
    }
}

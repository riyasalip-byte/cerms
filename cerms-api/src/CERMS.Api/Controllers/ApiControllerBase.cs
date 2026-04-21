using CERMS.Application.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    protected ActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            return Ok(new ApiResponse<T>
            {
                Success = true,
                Data = result.Value
            });
        }

        return BadRequest(new ApiResponse<T>
        {
            Success = false,
            Errors = new[] { result.Error ?? "An error occurred." }
        });
    }

    protected ActionResult HandleResult(Result result)
    {
        if (result.IsSuccess)
        {
            return Ok(new ApiResponse<object>
            {
                Success = true
            });
        }

        return BadRequest(new ApiResponse<object>
        {
            Success = false,
            Errors = new[] { result.Error ?? "An error occurred." }
        });
    }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string[] Errors { get; set; } = Array.Empty<string>();
}

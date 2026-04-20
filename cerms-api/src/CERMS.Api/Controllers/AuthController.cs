using CERMS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CERMS.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IJwtService _jwtService;

    public AuthController(IJwtService jwtService)
    {
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // Dummy validation
        if (request.Username == "admin" && request.Password == "password")
        {
            var token = _jwtService.GenerateToken(
                userId: Guid.Parse("00000000-0000-0000-0000-000000000001"),
                email: "admin@cerms.com",
                role: "Admin",
                companyId: Guid.Parse("00000000-0000-0000-0000-000000000001"),
                branchId: Guid.Parse("00000000-0000-0000-0000-000000000001")
            );

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Data = token
            });
        }

        return Unauthorized(new ApiResponse<string>
        {
            Success = false,
            Errors = new[] { "Invalid username or password." }
        });
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

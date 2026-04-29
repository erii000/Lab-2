using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelAssistant.Services.UserService.Contracts.Users;
using TravelAssistant.Services.UserService.Repositories.Interfaces;
using TravelAssistant.Services.UserService.Services.Interfaces;
using UserService.DTOs.User;


namespace TravelAssistant.Services.UserService.Controllers;

[ApiController]
[Route("api/v1/users")]
[Produces("application/json")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IUserSearchService _userSearchService;

    public UserController(IUserRepository userRepository, IUserSearchService userSearchService)
    {
        _userRepository = userRepository;
        _userSearchService = userSearchService;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Invalid token claims.");
        }

        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null)
        {
            return NotFound("User no longer exists.");
        }

        return Ok(new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.CreatedAt
        });
    }


    [Authorize(Roles = "Admin")]
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] UserSearchRequest request, CancellationToken ct)
    {
        var data = await _userSearchService.SearchAsync(request, ct);
        return Ok(data);
    }


    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateUserRequest request, CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null) return NotFound();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        await _userRepository.UpdateAsync(user, ct);

        return NoContent();
    }
}


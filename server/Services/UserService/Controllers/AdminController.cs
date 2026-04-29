using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.UserService.Repositories.Interfaces;
using UserService.DTOs.Admin;
using TravelAssistant.Services.UserService.Repositories.InMemory;

namespace TravelAssistant.Services.UserService.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/v1/admin/users")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public AdminController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAllUsers([FromQuery] UserQueryParams query, CancellationToken ct)
    {
        var (users, totalCount) = await _userRepository.GetUsersAsync(query, ct);

        var response = new
        {
            TotalCount = totalCount,
            PageSize = query.PageSize,
            CurrentPage = query.PageNumber,
            Items = users
        };
        return Ok(response);
    }
}

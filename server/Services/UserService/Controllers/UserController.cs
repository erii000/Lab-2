using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelAssistant.Common.Export;
using TravelAssistant.Services.UserService.Contracts.Users;
using TravelAssistant.Services.UserService.Models.Entities;
using TravelAssistant.Services.UserService.Repositories.Interfaces;
using TravelAssistant.Services.UserService.Services.Interfaces;
using UserService.DTOs.Admin;
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

        var roles = user.UserRoles
            .Where(ur => ur.Role != null)
            .Select(ur => ur.Role!.Name)
            .Distinct()
            .ToList();

        if (roles.Count == 0)
            roles.Add("Traveler");

        return Ok(new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.CreatedAt,
            Roles = roles
        });
    }


    [Authorize(Roles = "Admin")]
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] UserSearchRequest request, CancellationToken ct)
    {
        var data = await _userSearchService.SearchAsync(request, ct);
        return Ok(data);
    }

    /// <summary>Admin paged list (backlog: GET /api/v1/users).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> ListUsers([FromQuery] UserQueryParams query, CancellationToken ct)
    {
        var (users, totalCount) = await _userRepository.GetUsersAsync(query, ct);
        return Ok(UserListMapper.ToPagedResponse(users, totalCount, query));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("export")]
    public async Task<IActionResult> ExportUsers([FromQuery] string format = "json", [FromQuery] UserQueryParams? query = null, CancellationToken ct = default)
    {
        query ??= new UserQueryParams { PageNumber = 1, PageSize = 10_000 };
        query.PageNumber = 1;
        query.PageSize = Math.Min(query.PageSize, 10_000);

        var (users, _) = await _userRepository.GetUsersAsync(query, ct);
        var rows = users.Select(u => new[]
        {
            u.Id.ToString(),
            u.FirstName,
            u.LastName,
            u.Email,
            u.IsActive.ToString(),
            u.CreatedAt.ToString("O"),
            string.Join(";", u.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name))
        }).ToList();

        var headers = new[] { "Id", "FirstName", "LastName", "Email", "IsActive", "CreatedAt", "Roles" };
        var normalized = (format ?? "json").Trim().ToLowerInvariant();

        return normalized switch
        {
            "csv" => File(TabularExport.ToCsv(headers, rows), "text/csv", $"users-{DateTime.UtcNow:yyyyMMdd}.csv"),
            "xlsx" => File(
                TabularExport.ToXlsx("Users", headers, rows),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"users-{DateTime.UtcNow:yyyyMMdd}.xlsx"),
            _ => File(
                TabularExport.ToJsonUtf8(users.Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.IsActive,
                    u.CreatedAt,
                    Roles = u.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name)
                })),
                "application/json",
                $"users-{DateTime.UtcNow:yyyyMMdd}.json")
        };
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("import")]
    public async Task<IActionResult> ImportUsers([FromBody] IReadOnlyList<UserImportRow>? rows, CancellationToken ct)
    {
        if (rows is null || rows.Count == 0)
            return BadRequest(new { error = "Request body must be a non-empty JSON array." });

        var errors = new List<object>();
        var toInsert = new List<User>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        for (var i = 0; i < rows.Count; i++)
        {
            var r = rows[i];
            var rowNum = i + 1;
            if (string.IsNullOrWhiteSpace(r.FirstName) || string.IsNullOrWhiteSpace(r.LastName) ||
                string.IsNullOrWhiteSpace(r.Email) || string.IsNullOrWhiteSpace(r.Password))
            {
                errors.Add(new { row = rowNum, message = "FirstName, LastName, Email, and Password are required." });
                continue;
            }

            var email = r.Email.Trim().ToLowerInvariant();
            if (!seen.Add(email))
            {
                errors.Add(new { row = rowNum, message = "Duplicate email in import payload." });
                continue;
            }

            if (r.Password.Length < 6)
            {
                errors.Add(new { row = rowNum, message = "Password must be at least 6 characters." });
                continue;
            }

            if (await _userRepository.GetByEmailAsync(email, ct) is not null)
            {
                errors.Add(new { row = rowNum, message = "Email already registered." });
                continue;
            }

            toInsert.Add(new User
            {
                FirstName = r.FirstName.Trim(),
                LastName = r.LastName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(r.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (errors.Count > 0)
            return BadRequest(new { errors, inserted = 0 });

        await _userRepository.BulkAddAsync(toInsert, ct);
        return Ok(new { inserted = toInsert.Count });
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


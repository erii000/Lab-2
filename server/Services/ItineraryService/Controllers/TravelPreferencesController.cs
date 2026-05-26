using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Data;
using TravelAssistant.Services.ItineraryService.DTOs.TravelPreferences;
using TravelAssistant.Services.ItineraryService.Models.Entities;
using TravelAssistant.Services.ItineraryService.Security;

namespace TravelAssistant.Services.ItineraryService.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/travel-preferences")]
public sealed class TravelPreferencesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TravelPreferencesController(ApplicationDbContext db) => _db = db;

    [HttpGet("me")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var pref = await _db.TravelPreferences
            .AsNoTracking()
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
            .FirstOrDefaultAsync(ct);

        return pref is null ? Ok(null) : Ok(Map(pref));
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpsertMine([FromBody] UpsertTravelPreferencesRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var pref = await _db.TravelPreferences
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (pref is null)
        {
            pref = new TravelPreference
            {
                UserId = userId.Value,
                CreatedAt = DateTime.UtcNow
            };
            _db.TravelPreferences.Add(pref);
        }

        pref.PreferredTransport = request.PreferredTransport?.Trim();
        pref.PreferredAccommodation = request.PreferredAccommodation?.Trim();
        pref.BudgetMin = request.BudgetMin;
        pref.BudgetMax = request.BudgetMax;
        pref.FavoriteDestinationType = request.FavoriteDestinationType?.Trim();
        pref.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(Map(pref));
    }

    [HttpGet("user/{userId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetForUser(int userId, CancellationToken ct)
    {
        var pref = await _db.TravelPreferences
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
            .FirstOrDefaultAsync(ct);

        return pref is null ? Ok(null) : Ok(Map(pref));
    }

    [HttpPut("user/{userId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpsertForUser(int userId, [FromBody] UpsertTravelPreferencesRequest request, CancellationToken ct)
    {
        var pref = await _db.TravelPreferences
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (pref is null)
        {
            pref = new TravelPreference { UserId = userId, CreatedAt = DateTime.UtcNow };
            _db.TravelPreferences.Add(pref);
        }

        pref.PreferredTransport = request.PreferredTransport?.Trim();
        pref.PreferredAccommodation = request.PreferredAccommodation?.Trim();
        pref.BudgetMin = request.BudgetMin;
        pref.BudgetMax = request.BudgetMax;
        pref.FavoriteDestinationType = request.FavoriteDestinationType?.Trim();
        pref.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(Map(pref));
    }

    private static object Map(TravelPreference pref) => new
    {
        pref.Id,
        pref.UserId,
        pref.PreferredTransport,
        pref.PreferredAccommodation,
        pref.BudgetMin,
        pref.BudgetMax,
        pref.FavoriteDestinationType,
        pref.CreatedAt,
        pref.UpdatedAt
    };
}

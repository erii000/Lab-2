using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Data;
using TravelAssistant.Services.ItineraryService.Models.Entities;
using TravelAssistant.Services.ItineraryService.Security;

namespace TravelAssistant.Services.ItineraryService.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/saved-destinations")]
public sealed class SavedDestinationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SavedDestinationsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> ListMine(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var slugs = await _db.UserSavedDestinations
            .AsNoTracking()
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.SavedAt)
            .Select(x => x.DestinationSlug)
            .ToListAsync(ct);

        return Ok(slugs);
    }

    [HttpPut("{slug}")]
    public async Task<IActionResult> Save(string slug, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var normalized = slug.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(normalized))
            return BadRequest(new { error = "Slug is required." });

        var exists = await _db.UserSavedDestinations
            .AnyAsync(x => x.UserId == userId.Value && x.DestinationSlug == normalized, ct);
        if (!exists)
        {
            _db.UserSavedDestinations.Add(new UserSavedDestination
            {
                UserId = userId.Value,
                DestinationSlug = normalized,
                SavedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    [HttpDelete("{slug}")]
    public async Task<IActionResult> Remove(string slug, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var normalized = slug.Trim().ToLowerInvariant();
        var row = await _db.UserSavedDestinations
            .FirstOrDefaultAsync(x => x.UserId == userId.Value && x.DestinationSlug == normalized, ct);
        if (row is null)
            return NoContent();

        _db.UserSavedDestinations.Remove(row);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

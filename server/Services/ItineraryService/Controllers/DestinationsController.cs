using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Data;

namespace TravelAssistant.Services.ItineraryService.Controllers;

[ApiController]
[Route("api/v1/destinations")]
[Produces("application/json")]
public sealed class DestinationsController : ControllerBase
{
    private static readonly JsonSerializerOptions CatalogJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly ApplicationDbContext _db;

    public DestinationsController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>Full destination catalog for search, home, and booking flows.</summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var rows = await _db.Destinations
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => d.CatalogJson)
            .ToListAsync(ct);

        var catalog = ParseCatalogList(rows);
        return Ok(catalog);
    }

    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        var json = await _db.Destinations
            .AsNoTracking()
            .Where(d => d.Slug == normalized)
            .Select(d => d.CatalogJson)
            .FirstOrDefaultAsync(ct);

        if (string.IsNullOrEmpty(json))
            return NotFound();

        var item = ParseCatalogItem(json);
        return item is null ? NotFound() : Ok(item);
    }

    private static List<object> ParseCatalogList(IReadOnlyList<string> jsonRows)
    {
        var list = new List<object>();
        foreach (var json in jsonRows)
        {
            var item = ParseCatalogItem(json);
            if (item is not null)
                list.Add(item);
        }

        return list;
    }

    private static object? ParseCatalogItem(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<object>(json, CatalogJsonOptions);
        }
        catch
        {
            return null;
        }
    }
}

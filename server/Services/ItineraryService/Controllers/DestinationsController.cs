using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Data;
using TravelAssistant.Services.ItineraryService.DTOs.Destinations;

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

    /// <summary>Merges admin trip/catalog overrides into <c>CatalogJson.adminMeta</c>.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPatch("{slug}/admin-meta")]
    public async Task<IActionResult> PatchAdminMeta(
        string slug,
        [FromBody] PatchDestinationAdminMetaRequest request,
        CancellationToken ct)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        var row = await _db.Destinations.FirstOrDefaultAsync(d => d.Slug == normalized, ct);
        if (row is null)
            return NotFound();

        JsonObject root;
        try
        {
            root = JsonNode.Parse(row.CatalogJson)?.AsObject() ?? new JsonObject();
        }
        catch
        {
            root = new JsonObject();
        }

        var adminMeta = root["adminMeta"] as JsonObject ?? new JsonObject();
        if (request.Status is not null)
            adminMeta["status"] = request.Status.Trim().ToLowerInvariant();
        if (request.Featured is not null)
            adminMeta["featured"] = request.Featured.Value;
        if (request.HomepageVisible is not null)
            adminMeta["homepageVisible"] = request.HomepageVisible.Value;
        if (request.Title is not null)
            adminMeta["title"] = request.Title.Trim();
        if (request.Subtitle is not null)
            adminMeta["subtitle"] = request.Subtitle.Trim();
        if (request.Days is not null)
            adminMeta["days"] = request.Days.Value;
        if (request.Style is not null)
            adminMeta["style"] = request.Style.Trim().ToLowerInvariant();
        if (request.Capacity is not null)
            adminMeta["capacity"] = request.Capacity.Value;

        if (request.Title is not null)
            root["title"] = request.Title.Trim();
        if (request.Description is not null)
        {
            root["description"] = request.Description.Trim();
            row.Description = request.Description.Trim();
        }
        if (request.PriceFrom is not null)
        {
            root["priceFrom"] = request.PriceFrom.Value;
            row.PriceFrom = request.PriceFrom.Value;
        }
        if (request.Country is not null)
        {
            root["country"] = request.Country.Trim();
            row.Country = request.Country.Trim();
        }

        if (request.Gallery is not null)
        {
            var gallery = request.Gallery
                .Where(u => !string.IsNullOrWhiteSpace(u))
                .Select(u => u.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            var galleryNode = new JsonArray();
            foreach (var url in gallery)
                galleryNode.Add(url);
            root["gallery"] = galleryNode;
            if (gallery.Count > 0)
            {
                var cover = request.ImageUrl?.Trim() ?? gallery[0];
                root["image"] = cover;
                row.ImageUrl = cover;
            }
        }
        else if (request.ImageUrl is not null)
        {
            var cover = request.ImageUrl.Trim();
            root["image"] = cover;
            row.ImageUrl = cover;
        }

        root["adminMeta"] = adminMeta;
        row.CatalogJson = root.ToJsonString(CatalogJsonOptions);
        row.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        var item = ParseCatalogItem(row.CatalogJson);
        return item is null ? Ok(adminMeta) : Ok(item);
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

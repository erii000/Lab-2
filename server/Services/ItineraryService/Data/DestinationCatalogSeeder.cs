using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Models.Entities;

namespace TravelAssistant.Services.ItineraryService.Data;

/// <summary>
/// Seeds the destination catalog from Data/destination-catalog.json (exported from the React UI).
/// </summary>
public static class DestinationCatalogSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task SeedAsync(ApplicationDbContext db, CancellationToken ct = default)
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Data", "destination-catalog.json");
        if (!File.Exists(path))
        {
            path = Path.Combine(Directory.GetCurrentDirectory(), "Data", "destination-catalog.json");
        }

        if (!File.Exists(path))
            return;

        await using var stream = File.OpenRead(path);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
        if (doc.RootElement.ValueKind != JsonValueKind.Array)
            return;

        foreach (var element in doc.RootElement.EnumerateArray())
        {
            if (!TryGetString(element, "id", out var id) || string.IsNullOrWhiteSpace(id))
                continue;

            var slug = id.Trim().ToLowerInvariant();
            var catalogJson = element.GetRawText();
            var meta = JsonSerializer.Deserialize<CatalogSeedItem>(catalogJson, JsonOptions);
            if (meta is null)
                continue;

            var existing = await db.Destinations.FirstOrDefaultAsync(d => d.Slug == slug, ct);

            if (existing is null)
            {
                db.Destinations.Add(new Destination
                {
                    Slug = slug,
                    Name = meta.Title ?? slug,
                    City = meta.Title ?? slug,
                    Country = meta.Country ?? "",
                    Description = meta.Description,
                    ImageUrl = meta.Image,
                    PriceFrom = meta.PriceFrom,
                    Rating = meta.Rating,
                    ReviewCount = meta.ReviewCount ?? 0,
                    Tag = meta.Tag,
                    CatalogJson = catalogJson,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else
            {
                existing.Name = meta.Title ?? existing.Name;
                existing.City = meta.Title ?? existing.City;
                existing.Country = meta.Country ?? existing.Country;
                existing.Description = meta.Description;
                existing.ImageUrl = meta.Image;
                existing.PriceFrom = meta.PriceFrom;
                existing.Rating = meta.Rating;
                existing.ReviewCount = meta.ReviewCount ?? existing.ReviewCount;
                existing.Tag = meta.Tag;
                existing.CatalogJson = catalogJson;
                existing.UpdatedAt = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private static bool TryGetString(JsonElement element, string propertyName, out string? value)
    {
        foreach (var property in element.EnumerateObject())
        {
            if (!property.Name.Equals(propertyName, StringComparison.OrdinalIgnoreCase))
                continue;

            value = property.Value.ValueKind switch
            {
                JsonValueKind.String => property.Value.GetString(),
                JsonValueKind.Number => property.Value.GetRawText(),
                _ => property.Value.ToString()
            };
            return !string.IsNullOrWhiteSpace(value);
        }

        value = null;
        return false;
    }

    private sealed class CatalogSeedItem
    {
        public string? Id { get; set; }
        public string? Title { get; set; }
        public string? Country { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }
        public decimal? PriceFrom { get; set; }
        public decimal? Rating { get; set; }
        public int? ReviewCount { get; set; }
        public string? Tag { get; set; }
    }
}

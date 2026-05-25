using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Models.Entities;

namespace TravelAssistant.Services.ItineraryService.Data;

/// <summary>
/// Seeds admin-visible trips from destination catalog rows.
/// </summary>
public static class TripCatalogSeeder
{
    private static readonly string[] Statuses = ["active", "published", "draft", "pending_review", "active", "published", "fully_booked", "active"];

    public static async Task SeedAsync(ApplicationDbContext db, CancellationToken ct = default)
    {
        var destinations = await db.Destinations.AsNoTracking().OrderBy(d => d.Name).ToListAsync(ct);
        if (destinations.Count == 0)
            return;

        var adminUserId = 1;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var index = 0;

        foreach (var dest in destinations)
        {
            var title = $"{dest.Name} Escape";
            var exists = await db.Trips.AnyAsync(
                t => t.Title == title && t.UserId == adminUserId,
                ct);
            if (exists)
            {
                index++;
                continue;
            }

            var start = today.AddDays(30 + index * 7);
            var end = start.AddDays(4 + (index % 3));
            var trip = new Trip
            {
                UserId = adminUserId,
                Title = title,
                StartDate = start,
                EndDate = end,
                Budget = dest.PriceFrom ?? 1200,
                Status = Statuses[index % Statuses.Length],
                CreatedAt = DateTime.UtcNow,
            };
            db.Trips.Add(trip);
            await db.SaveChangesAsync(ct);

            db.TripDestinations.Add(new TripDestination
            {
                TripId = trip.Id,
                DestinationId = dest.Id,
                VisitDate = start,
            });
            await db.SaveChangesAsync(ct);
            index++;
        }
    }
}

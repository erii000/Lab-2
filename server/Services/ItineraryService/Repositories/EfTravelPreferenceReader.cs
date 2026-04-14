using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Data;
using TravelAssistant.Services.ItineraryService.Models.Entities;

namespace TravelAssistant.Services.ItineraryService.Repositories;

public sealed class EfTravelPreferenceReader : ITravelPreferenceReader
{
    private readonly ApplicationDbContext _dbContext;

    public EfTravelPreferenceReader(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<TravelPreference?> GetLatestForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.TravelPreferences
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }
}

using TravelAssistant.Services.ItineraryService.Models.Entities;

namespace TravelAssistant.Services.ItineraryService.Repositories;

public interface ITravelPreferenceReader
{
    Task<TravelPreference?> GetLatestForUserAsync(int userId, CancellationToken cancellationToken = default);
}

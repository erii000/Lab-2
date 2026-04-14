using TravelAssistant.Services.ItineraryService.Models.Entities;

namespace TravelAssistant.Services.ItineraryService.Repositories;

public interface IItineraryRepository
{
    Task<Itinerary?> GetWithDaysAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Itinerary>> ListForUserAsync(int userId, CancellationToken cancellationToken = default);
    Task AddAsync(Itinerary itinerary, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

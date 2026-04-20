using TravelAssistant.Services.ItineraryService.Contracts.Itineraries;

namespace TravelAssistant.Services.ItineraryService.Services.Interfaces;

public interface IItinerarySearchService
{
    Task<PagedResult<ItinerarySearchItemResponse>> SearchAsync(ItinerarySearchRequest request, CancellationToken cancellationToken = default);
}

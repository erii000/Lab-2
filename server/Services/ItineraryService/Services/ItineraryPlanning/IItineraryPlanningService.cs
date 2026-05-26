using TravelAssistant.Services.ItineraryService.DTOs.Itineraries;

namespace TravelAssistant.Services.ItineraryService.Services.ItineraryPlanning;

public interface IItineraryPlanningService
{
    Task<GenerateItineraryResponse> GenerateAsync(int userId, GenerateItineraryRequest request, CancellationToken cancellationToken = default);
    Task<ItineraryDetailResponse?> GetByIdAsync(int itineraryId, int requestingUserId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ItinerarySummaryDto>> ListForUserAsync(int targetUserId, int requestingUserId, bool isAdmin, CancellationToken cancellationToken = default);

    Task<ItineraryDetailResponse?> SaveTimelineAsync(
        int itineraryId,
        int requestingUserId,
        bool isAdmin,
        SaveItineraryTimelineRequest request,
        CancellationToken cancellationToken = default);
}

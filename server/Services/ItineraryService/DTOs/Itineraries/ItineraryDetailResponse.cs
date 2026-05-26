namespace TravelAssistant.Services.ItineraryService.DTOs.Itineraries;

public sealed class ItineraryDetailResponse
{
    public int Id { get; init; }
    public int UserId { get; init; }
    public string Destination { get; init; } = string.Empty;
    public string? Country { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? StoredSummary { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public IReadOnlyList<ItineraryDayDto> Days { get; init; } = Array.Empty<ItineraryDayDto>();
    public string? TimelineJson { get; init; }
    public TravelPreferenceSnapshotDto? PreferencesUsed { get; init; }
}

public sealed class TravelPreferenceSnapshotDto
{
    public string? PreferredTransport { get; init; }
    public string? PreferredAccommodation { get; init; }
    public decimal? BudgetMin { get; init; }
    public decimal? BudgetMax { get; init; }
    public string? FavoriteDestinationType { get; init; }
}

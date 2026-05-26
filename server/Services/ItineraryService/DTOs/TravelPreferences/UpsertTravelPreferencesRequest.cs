namespace TravelAssistant.Services.ItineraryService.DTOs.TravelPreferences;

public sealed class UpsertTravelPreferencesRequest
{
    public string? PreferredTransport { get; init; }
    public string? PreferredAccommodation { get; init; }
    public decimal? BudgetMin { get; init; }
    public decimal? BudgetMax { get; init; }
    public string? FavoriteDestinationType { get; init; }
}

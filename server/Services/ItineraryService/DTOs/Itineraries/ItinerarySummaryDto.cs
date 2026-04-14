namespace TravelAssistant.Services.ItineraryService.DTOs.Itineraries;

public sealed class ItinerarySummaryDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Destination { get; init; } = string.Empty;
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
}

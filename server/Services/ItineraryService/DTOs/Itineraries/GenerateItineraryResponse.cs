namespace TravelAssistant.Services.ItineraryService.DTOs.Itineraries;

public sealed class GenerateItineraryResponse
{
    public int Id { get; init; }
    public int UserId { get; init; }
    public string Destination { get; init; } = string.Empty;
    public IReadOnlyList<ItineraryDayDto> Days { get; init; } = Array.Empty<ItineraryDayDto>();
}

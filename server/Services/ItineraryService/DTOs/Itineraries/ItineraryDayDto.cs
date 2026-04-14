using System.Text.Json.Serialization;

namespace TravelAssistant.Services.ItineraryService.DTOs.Itineraries;

public sealed class ItineraryDayDto
{
    [JsonPropertyName("day")]
    public int Day { get; init; }

    public DateOnly Date { get; init; }
    public IReadOnlyList<string> Activities { get; init; } = Array.Empty<string>();

    [JsonPropertyName("transport")]
    public string Transport { get; init; } = string.Empty;

    [JsonPropertyName("meals")]
    public IReadOnlyList<string> Meals { get; init; } = Array.Empty<string>();
}

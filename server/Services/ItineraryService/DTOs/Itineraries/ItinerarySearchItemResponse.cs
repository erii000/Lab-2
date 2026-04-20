namespace TravelAssistant.Services.ItineraryService.Contracts.Itineraries;

public sealed class ItinerarySearchItemResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal? Budget { get; set; }
    public IReadOnlyList<string> Destinations { get; set; } = Array.Empty<string>();
}

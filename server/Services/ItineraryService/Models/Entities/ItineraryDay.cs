namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class ItineraryDay
{
    public int Id { get; set; }
    public int ItineraryId { get; set; }
    public Itinerary Itinerary { get; set; } = null!;
    public int DayNumber { get; set; }
    public DateOnly Date { get; set; }
    public string TransportSuggestion { get; set; } = string.Empty;
    public string MealSuggestion { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<ItineraryDayActivity> Activities { get; set; } = new List<ItineraryDayActivity>();
}

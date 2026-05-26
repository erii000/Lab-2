namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class Itinerary : BaseEntity
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? Description { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    /// <summary>Planner timeline JSON (days, activities, times) from the client.</summary>
    public string? TimelineJson { get; set; }
    public ICollection<ItineraryDay> Days { get; set; } = new List<ItineraryDay>();
}

namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class Itinerary : BaseEntity
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}

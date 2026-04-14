namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class ItineraryDayActivity
{
    public int Id { get; set; }
    public int ItineraryDayId { get; set; }
    public ItineraryDay ItineraryDay { get; set; } = null!;
    public int SortOrder { get; set; }
    public string Description { get; set; } = string.Empty;
}

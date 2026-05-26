namespace TravelAssistant.Services.ItineraryService.DTOs.Itineraries;

public sealed class SaveItineraryTimelineRequest
{
    public IReadOnlyList<PlannerDayDto> Days { get; set; } = Array.Empty<PlannerDayDto>();
}

public sealed class PlannerDayDto
{
    public int Day { get; set; }
    public string Label { get; set; } = string.Empty;
    public IReadOnlyList<PlannerActivityDto> Activities { get; set; } = Array.Empty<PlannerActivityDto>();
}

public sealed class PlannerActivityDto
{
    public string Id { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public bool IsCustom { get; set; }
}

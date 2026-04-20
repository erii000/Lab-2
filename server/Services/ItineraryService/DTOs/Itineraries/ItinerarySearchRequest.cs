namespace TravelAssistant.Services.ItineraryService.Contracts.Itineraries;

public sealed class ItinerarySearchRequest
{
    public string? Q { get; set; }
    public string? Destination { get; set; }
    public string? Status { get; set; }
    public int? UserId { get; set; }
    public DateOnly? StartFrom { get; set; }
    public DateOnly? EndTo { get; set; }
    public string SortBy { get; set; } = "startDate";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

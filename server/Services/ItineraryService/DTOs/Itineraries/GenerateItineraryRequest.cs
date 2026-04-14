namespace TravelAssistant.Services.ItineraryService.DTOs.Itineraries;

/// <summary>
/// Matches <c>API_CONTRACT_SPRINT1.md</c> (destination + optional tuning fields).
/// </summary>
public sealed class GenerateItineraryRequest
{
    public string Destination { get; set; } = string.Empty;
    public string? Country { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? BudgetLevel { get; set; }
    public string? TransportMode { get; set; }
    public string? TripTitle { get; set; }
}

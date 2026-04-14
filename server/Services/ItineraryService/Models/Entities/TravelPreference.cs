namespace TravelAssistant.Services.ItineraryService.Models.Entities;

/// <summary>
/// Read model for shared MSSQL table <c>TravelPreferences</c> (owned by UserService domain, read here for itinerary generation).
/// </summary>
public sealed class TravelPreference
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? PreferredTransport { get; set; }
    public string? PreferredAccommodation { get; set; }
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public string? FavoriteDestinationType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

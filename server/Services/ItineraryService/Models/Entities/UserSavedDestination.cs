namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class UserSavedDestination
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string DestinationSlug { get; set; } = string.Empty;
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}

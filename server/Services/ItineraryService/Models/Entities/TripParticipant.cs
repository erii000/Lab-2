namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class TripParticipant
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public int UserId { get; set; }
    public string? Role { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public Trip? Trip { get; set; }
}

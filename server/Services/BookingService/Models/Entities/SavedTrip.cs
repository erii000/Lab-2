namespace TravelAssistant.Services.BookingService.Models.Entities;

public sealed class SavedTrip
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TripId { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}

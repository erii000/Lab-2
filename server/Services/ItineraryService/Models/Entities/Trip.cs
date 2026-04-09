namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class Trip : BaseEntity
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal? Budget { get; set; }
    public string Status { get; set; } = string.Empty;

    public ICollection<TripDestination> TripDestinations { get; set; } = new List<TripDestination>();
    public ICollection<TripParticipant> TripParticipants { get; set; } = new List<TripParticipant>();
}

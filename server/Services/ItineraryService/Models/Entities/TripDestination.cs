namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class TripDestination
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public int DestinationId { get; set; }
    public DateOnly? VisitDate { get; set; }

    public Trip? Trip { get; set; }
    public Destination? Destination { get; set; }
}

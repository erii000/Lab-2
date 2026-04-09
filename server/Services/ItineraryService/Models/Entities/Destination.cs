namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class Destination : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<TripDestination> TripDestinations { get; set; } = new List<TripDestination>();
}

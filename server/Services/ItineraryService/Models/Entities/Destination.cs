namespace TravelAssistant.Services.ItineraryService.Models.Entities;

public sealed class Destination : BaseEntity
{
    /// <summary>URL-safe id matching frontend catalog (e.g. paris, new-york).</summary>
    public string Slug { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Description { get; set; }

    public string? ImageUrl { get; set; }
    public decimal? PriceFrom { get; set; }
    public decimal? Rating { get; set; }
    public int ReviewCount { get; set; }
    public string? Tag { get; set; }

    /// <summary>Full frontend catalog object (activities, gallery, reviews, etc.) as JSON.</summary>
    public string CatalogJson { get; set; } = "{}";

    public ICollection<TripDestination> TripDestinations { get; set; } = new List<TripDestination>();
}

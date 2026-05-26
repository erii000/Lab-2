namespace TravelAssistant.Services.ItineraryService.DTOs.Destinations;

public sealed class PatchDestinationAdminMetaRequest
{
    public string? Status { get; init; }
    public bool? Featured { get; init; }
    public bool? HomepageVisible { get; init; }
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string? Country { get; init; }
    public string? Description { get; init; }
    public decimal? PriceFrom { get; init; }
    public int? Days { get; init; }
    public string? Style { get; init; }
    public int? Capacity { get; init; }
    public string? ImageUrl { get; init; }
    public IReadOnlyList<string>? Gallery { get; init; }
}

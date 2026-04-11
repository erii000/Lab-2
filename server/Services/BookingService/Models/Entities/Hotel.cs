namespace TravelAssistant.Services.BookingService.Models.Entities;

public sealed class Hotel : BaseEntity
{
    public int DestinationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public decimal? Rating { get; set; }
    public decimal? PricePerNight { get; set; }
}

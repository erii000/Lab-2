namespace TravelAssistant.Services.BookingService.Models.Entities;

public sealed class TransportOption : BaseEntity
{
    public int DestinationId { get; set; }
    public string TransportType { get; set; } = string.Empty;
    public string? Provider { get; set; }
    public decimal? Price { get; set; }
}

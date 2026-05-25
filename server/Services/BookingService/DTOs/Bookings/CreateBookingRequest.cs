namespace TravelAssistant.Services.BookingService.DTOs.Bookings;

public sealed class CreateBookingRequest
{
    public int? ItineraryId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string BookingType { get; set; } = string.Empty;
    public string ReferenceCode { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public string? MetadataJson { get; set; }
}

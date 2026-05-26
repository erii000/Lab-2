namespace TravelAssistant.Services.BookingService.DTOs.Bookings;

public sealed class UpdateBookingRequest
{
    public int? ItineraryId { get; set; }
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public string? MetadataJson { get; set; }
}

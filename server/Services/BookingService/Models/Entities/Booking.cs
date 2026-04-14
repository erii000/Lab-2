namespace TravelAssistant.Services.BookingService.Models.Entities;

public sealed class Booking : BaseEntity
{
    public int UserId { get; set; }
    public int? ItineraryId { get; set; }
    public string BookingType { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string ReferenceCode { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public DateOnly BookingDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

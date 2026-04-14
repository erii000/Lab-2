namespace TravelAssistant.Services.BookingService.DTOs.Bookings;

public sealed class BookingDetailResponse
{
    public int Id { get; init; }
    public int UserId { get; init; }
    public int? ItineraryId { get; init; }
    public string Provider { get; init; } = string.Empty;
    public string BookingType { get; init; } = string.Empty;
    public string ReferenceCode { get; init; } = string.Empty;
    public decimal? Amount { get; init; }
    public string? Currency { get; init; }
    public DateOnly BookingDate { get; init; }
    public string Status { get; init; } = string.Empty;
}

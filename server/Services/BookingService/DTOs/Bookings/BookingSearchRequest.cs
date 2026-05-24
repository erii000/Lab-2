namespace TravelAssistant.Services.BookingService.DTOs.Bookings;

public sealed class BookingSearchRequest
{
    public string? Q { get; set; }
    public string? Status { get; set; }
    public string? Provider { get; set; }
    public DateOnly? BookingDateFrom { get; set; }
    public DateOnly? BookingDateTo { get; set; }
    public string SortBy { get; set; } = "bookingDate";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

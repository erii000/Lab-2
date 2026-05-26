namespace TravelAssistant.Services.SupportService.Contracts;

public sealed class CreateContactTicketRequest
{
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? BookingId { get; set; }
    public string? TripType { get; set; }
    public string? Priority { get; set; }
}

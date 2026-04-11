namespace TravelAssistant.Services.BookingService.Models.Entities;

public sealed class Flight : BaseEntity
{
    public int UserId { get; set; }
    public string FromCity { get; set; } = string.Empty;
    public string ToCity { get; set; } = string.Empty;
    public DateTime DepartureDate { get; set; }
    public DateTime ArrivalDate { get; set; }
    public string? Airline { get; set; }
    public decimal? Price { get; set; }
}

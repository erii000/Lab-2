namespace TravelAssistant.Services.WeatherExternalDataService.DTOs.Flights;

public sealed class FlightStatusDto
{
    public string FlightNumber { get; init; } = string.Empty;
    public string? Airline { get; init; }
    public string? DepartureAirport { get; init; }
    public string? ArrivalAirport { get; init; }
    public DateTime? ScheduledDepartureUtc { get; init; }
    public DateTime? EstimatedDepartureUtc { get; init; }
    public string? Status { get; init; }
}

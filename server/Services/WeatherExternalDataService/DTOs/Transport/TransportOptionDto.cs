namespace TravelAssistant.Services.WeatherExternalDataService.DTOs.Transport;

public sealed class TransportOptionDto
{
    public string Provider { get; init; } = string.Empty;
    public string Mode { get; init; } = string.Empty;
    public int EstimatedMinutes { get; init; }
    public decimal EstimatedPrice { get; init; }
    public string Currency { get; init; } = "USD";
}

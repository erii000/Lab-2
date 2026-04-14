namespace TravelAssistant.Services.WeatherExternalDataService.DTOs.Weather;

public sealed class WeatherCurrentDto
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public string City { get; init; } = string.Empty;
    public string? CountryCode { get; init; }
    public double TemperatureC { get; init; }
    public double WindSpeedKmh { get; init; }
    public int WeatherCode { get; init; }
    public DateTime RetrievedAtUtc { get; init; }
}

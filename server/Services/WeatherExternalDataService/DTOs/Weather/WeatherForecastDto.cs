namespace TravelAssistant.Services.WeatherExternalDataService.DTOs.Weather;

public sealed class WeatherForecastDto
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public string City { get; init; } = string.Empty;
    public string? CountryCode { get; init; }
    public IReadOnlyList<DailyForecastPointDto> Daily { get; init; } = Array.Empty<DailyForecastPointDto>();
    public DateTime RetrievedAtUtc { get; init; }
}

public sealed class DailyForecastPointDto
{
    public DateOnly Date { get; init; }
    public double MaxTemperatureC { get; init; }
    public double MinTemperatureC { get; init; }
    public double PrecipitationProbability { get; init; }
    public int WeatherCode { get; init; }
}

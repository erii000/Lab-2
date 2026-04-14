using TravelAssistant.Services.WeatherExternalDataService.DTOs.Weather;

namespace TravelAssistant.Services.WeatherExternalDataService.Services.Weather;

public interface IWeatherClient
{
    Task<WeatherCurrentDto> GetCurrentAsync(string city, string? countryCode, CancellationToken cancellationToken = default);
    Task<WeatherForecastDto> GetForecastAsync(string city, string? countryCode, int days, CancellationToken cancellationToken = default);
}

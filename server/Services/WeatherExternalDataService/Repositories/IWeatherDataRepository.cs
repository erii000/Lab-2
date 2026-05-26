using TravelAssistant.Services.WeatherExternalDataService.Models;

namespace TravelAssistant.Services.WeatherExternalDataService.Repositories;

public interface IWeatherDataRepository
{
    Task<IReadOnlyList<WeatherData>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WeatherData>> GetByCityAsync(string city, CancellationToken cancellationToken = default);
    Task<WeatherData> AddAsync(WeatherData weatherData, CancellationToken cancellationToken = default);
}

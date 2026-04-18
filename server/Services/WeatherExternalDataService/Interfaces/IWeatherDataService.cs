using TravelAssistant.Services.WeatherExternalDataService.Models;

namespace TravelAssistant.Services.WeatherExternalDataService.Interfaces
{
    public interface IWeatherDataService
    {
        Task<IEnumerable<WeatherData>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<WeatherData>> GetByCityAsync(string city, CancellationToken cancellationToken = default);
        Task<WeatherData> CreateAsync(WeatherData weatherData, CancellationToken cancellationToken = default);
    }
}
using TravelAssistant.Services.WeatherExternalDataService.Interfaces;
using TravelAssistant.Services.WeatherExternalDataService.Models;
using TravelAssistant.Services.WeatherExternalDataService.Repositories;

namespace TravelAssistant.Services.WeatherExternalDataService.Services;

public sealed class WeatherDataService : IWeatherDataService
{
    private readonly IWeatherDataRepository _repository;

    public WeatherDataService(IWeatherDataRepository repository) => _repository = repository;

    public async Task<IEnumerable<WeatherData>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _repository.GetAllAsync(cancellationToken);

    public async Task<IEnumerable<WeatherData>> GetByCityAsync(string city, CancellationToken cancellationToken = default) =>
        await _repository.GetByCityAsync(city, cancellationToken);

    public Task<WeatherData> CreateAsync(WeatherData weatherData, CancellationToken cancellationToken = default) =>
        _repository.AddAsync(weatherData, cancellationToken);
}

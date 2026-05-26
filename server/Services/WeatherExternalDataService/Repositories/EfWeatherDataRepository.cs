using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.WeatherExternalDataService.Data;
using TravelAssistant.Services.WeatherExternalDataService.Models;

namespace TravelAssistant.Services.WeatherExternalDataService.Repositories;

public sealed class EfWeatherDataRepository : IWeatherDataRepository
{
    private readonly ApplicationDbContext _context;

    public EfWeatherDataRepository(ApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<WeatherData>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.WeatherData.OrderByDescending(x => x.ForecastDate).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<WeatherData>> GetByCityAsync(string city, CancellationToken cancellationToken = default) =>
        await _context.WeatherData
            .Where(x => x.City == city)
            .OrderByDescending(x => x.ForecastDate)
            .ToListAsync(cancellationToken);

    public async Task<WeatherData> AddAsync(WeatherData weatherData, CancellationToken cancellationToken = default)
    {
        _context.WeatherData.Add(weatherData);
        await _context.SaveChangesAsync(cancellationToken);
        return weatherData;
    }
}

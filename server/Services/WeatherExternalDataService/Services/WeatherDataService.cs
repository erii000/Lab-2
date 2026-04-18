using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.WeatherExternalDataService.Data;
using TravelAssistant.Services.WeatherExternalDataService.Interfaces;
using TravelAssistant.Services.WeatherExternalDataService.Models;

namespace TravelAssistant.Services.WeatherExternalDataService.Services
{
    public sealed class WeatherDataService : IWeatherDataService
    {
        private readonly ApplicationDbContext _context;

        public WeatherDataService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WeatherData>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.WeatherData
                .OrderByDescending(x => x.ForecastDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<WeatherData>> GetByCityAsync(string city, CancellationToken cancellationToken = default)
        {
            return await _context.WeatherData
                .Where(x => x.City == city)
                .OrderByDescending(x => x.ForecastDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<WeatherData> CreateAsync(WeatherData weatherData, CancellationToken cancellationToken = default)
        {
            _context.WeatherData.Add(weatherData);
            await _context.SaveChangesAsync(cancellationToken);
            return weatherData;
        }
    }
}
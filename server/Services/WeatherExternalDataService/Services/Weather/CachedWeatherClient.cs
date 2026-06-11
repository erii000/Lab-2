using TravelAssistant.Common.Caching;
using TravelAssistant.Services.WeatherExternalDataService.DTOs.Weather;

namespace TravelAssistant.Services.WeatherExternalDataService.Services.Weather;

public sealed class CachedWeatherClient : IWeatherClient
{
    private static readonly TimeSpan CurrentTtl = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan ForecastTtl = TimeSpan.FromMinutes(30);

    private readonly OpenMeteoWeatherClient _inner;
    private readonly IResponseCache _cache;

    public CachedWeatherClient(OpenMeteoWeatherClient inner, IResponseCache cache)
    {
        _inner = inner;
        _cache = cache;
    }

    public Task<WeatherCurrentDto> GetCurrentAsync(string city, string? countryCode, CancellationToken cancellationToken = default)
    {
        var key = BuildKey("current", city, countryCode);
        return _cache.GetOrCreateAsync(
            key,
            ct => _inner.GetCurrentAsync(city, countryCode, ct),
            CurrentTtl,
            cancellationToken);
    }

    public Task<WeatherForecastDto> GetForecastAsync(string city, string? countryCode, int days, CancellationToken cancellationToken = default)
    {
        days = Math.Clamp(days, 1, 16);
        var key = BuildKey($"forecast:{days}", city, countryCode);
        return _cache.GetOrCreateAsync(
            key,
            ct => _inner.GetForecastAsync(city, countryCode, days, ct),
            ForecastTtl,
            cancellationToken);
    }

    private static string BuildKey(string prefix, string city, string? countryCode)
    {
        var normalizedCity = city.Trim().ToLowerInvariant();
        var normalizedCountry = string.IsNullOrWhiteSpace(countryCode)
            ? "any"
            : countryCode.Trim().ToLowerInvariant();
        return $"weather:{prefix}:{normalizedCity}:{normalizedCountry}";
    }
}

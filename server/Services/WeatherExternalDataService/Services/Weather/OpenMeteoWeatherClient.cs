using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using TravelAssistant.Services.WeatherExternalDataService.DTOs.Weather;

namespace TravelAssistant.Services.WeatherExternalDataService.Services.Weather;

public sealed class OpenMeteoWeatherClient : IWeatherClient
{
    private static readonly JsonSerializerOptions ApiJson = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    private readonly IHttpClientFactory _httpClientFactory;

    public OpenMeteoWeatherClient(IHttpClientFactory httpClientFactory) => _httpClientFactory = httpClientFactory;

    public async Task<WeatherCurrentDto> GetCurrentAsync(string city, string? countryCode, CancellationToken cancellationToken = default)
    {
        var (lat, lon, resolvedCity, resolvedCountry) = await GeocodeAsync(city, countryCode, cancellationToken);
        var forecast = _httpClientFactory.CreateClient("OpenMeteoForecast");
        var uri =
            $"forecast?latitude={lat.ToString(CultureInfo.InvariantCulture)}&longitude={lon.ToString(CultureInfo.InvariantCulture)}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto";
        using var response = await forecast.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();
        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = doc.RootElement;
        var current = root.GetProperty("current");
        return new WeatherCurrentDto
        {
            Latitude = lat,
            Longitude = lon,
            City = resolvedCity,
            CountryCode = resolvedCountry,
            TemperatureC = current.GetProperty("temperature_2m").GetDouble(),
            WindSpeedKmh = current.GetProperty("wind_speed_10m").GetDouble(),
            WeatherCode = current.GetProperty("weather_code").GetInt32(),
            RetrievedAtUtc = DateTime.UtcNow
        };
    }

    public async Task<WeatherForecastDto> GetForecastAsync(string city, string? countryCode, int days, CancellationToken cancellationToken = default)
    {
        days = Math.Clamp(days, 1, 16);
        var (lat, lon, resolvedCity, resolvedCountry) = await GeocodeAsync(city, countryCode, cancellationToken);
        var forecast = _httpClientFactory.CreateClient("OpenMeteoForecast");
        var uri =
            $"forecast?latitude={lat.ToString(CultureInfo.InvariantCulture)}&longitude={lon.ToString(CultureInfo.InvariantCulture)}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days={days}&timezone=auto";
        using var response = await forecast.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<OpenMeteoDailyResponse>(ApiJson, cancellationToken)
                      ?? throw new InvalidOperationException("Open-Meteo returned an empty forecast payload.");

        var list = new List<DailyForecastPointDto>();
        for (var i = 0; i < payload.Daily.Time.Count; i++)
        {
            list.Add(new DailyForecastPointDto
            {
                Date = DateOnly.Parse(payload.Daily.Time[i], CultureInfo.InvariantCulture),
                MaxTemperatureC = payload.Daily.Temperature2mMax[i],
                MinTemperatureC = payload.Daily.Temperature2mMin[i],
                PrecipitationProbability = payload.Daily.PrecipitationProbabilityMax[i],
                WeatherCode = payload.Daily.WeatherCode[i]
            });
        }

        return new WeatherForecastDto
        {
            Latitude = lat,
            Longitude = lon,
            City = resolvedCity,
            CountryCode = resolvedCountry,
            Daily = list,
            RetrievedAtUtc = DateTime.UtcNow
        };
    }

    private async Task<(double Lat, double Lon, string City, string? CountryCode)> GeocodeAsync(
        string city,
        string? countryCode,
        CancellationToken cancellationToken)
    {
        var geo = _httpClientFactory.CreateClient("OpenMeteoGeocode");
        var q = Uri.EscapeDataString(city);
        var cc = string.IsNullOrWhiteSpace(countryCode) ? string.Empty : $"&country={Uri.EscapeDataString(countryCode)}";
        using var response = await geo.GetAsync($"search?name={q}{cc}&count=1&language=en&format=json", cancellationToken);
        response.EnsureSuccessStatusCode();
        var doc = await response.Content.ReadFromJsonAsync<GeocodeResponse>(ApiJson, cancellationToken: cancellationToken)
                  ?? throw new InvalidOperationException("Geocoding returned no data.");

        if (doc.Results is null || doc.Results.Count == 0)
            throw new InvalidOperationException($"No coordinates found for '{city}'.");

        var r = doc.Results[0];
        return (r.Latitude, r.Longitude, r.Name, r.CountryCode);
    }

    private sealed class GeocodeResponse
    {
        public List<GeocodeResult>? Results { get; set; }
    }

    private sealed class GeocodeResult
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CountryCode { get; set; }
    }

    private sealed class OpenMeteoDailyResponse
    {
        public DailyBlock Daily { get; set; } = new();
    }

    private sealed class DailyBlock
    {
        public List<string> Time { get; set; } = new();
        public List<int> WeatherCode { get; set; } = new();
        public List<double> Temperature2mMax { get; set; } = new();
        public List<double> Temperature2mMin { get; set; } = new();
        public List<double> PrecipitationProbabilityMax { get; set; } = new();
    }
}

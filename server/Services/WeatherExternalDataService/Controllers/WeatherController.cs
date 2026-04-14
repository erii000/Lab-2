using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.WeatherExternalDataService.DTOs.Weather;
using TravelAssistant.Services.WeatherExternalDataService.Services.Weather;

namespace TravelAssistant.Services.WeatherExternalDataService.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/weather")]
public sealed class WeatherController : ControllerBase
{
    private readonly IWeatherClient _weatherClient;

    public WeatherController(IWeatherClient weatherClient) => _weatherClient = weatherClient;

    [HttpGet("current")]
    public Task<WeatherCurrentDto> GetCurrent([FromQuery] string city, [FromQuery] string? country, CancellationToken cancellationToken) =>
        _weatherClient.GetCurrentAsync(city, country, cancellationToken);

    [HttpGet("forecast")]
    public Task<WeatherForecastDto> GetForecast(
        [FromQuery] string city,
        [FromQuery] string? country,
        [FromQuery] int days = 7,
        CancellationToken cancellationToken = default) =>
        _weatherClient.GetForecastAsync(city, country, days, cancellationToken);
}

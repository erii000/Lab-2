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
    [ProducesResponseType(typeof(WeatherCurrentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<WeatherCurrentDto>> GetCurrent(
        [FromQuery] string city,
        [FromQuery] string? country,
        CancellationToken cancellationToken)
    {
        try
        {
            var dto = await _weatherClient.GetCurrentAsync(city, country, cancellationToken);
            return Ok(dto);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { error = ex.Message });
        }
    }

    [HttpGet("forecast")]
    [ProducesResponseType(typeof(WeatherForecastDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<WeatherForecastDto>> GetForecast(
        [FromQuery] string city,
        [FromQuery] string? country,
        [FromQuery] int days = 7,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var dto = await _weatherClient.GetForecastAsync(city, country, days, cancellationToken);
            return Ok(dto);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { error = ex.Message });
        }
    }
}

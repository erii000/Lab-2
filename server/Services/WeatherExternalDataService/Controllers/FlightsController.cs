using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.WeatherExternalDataService.DTOs.Flights;
using TravelAssistant.Services.WeatherExternalDataService.Services.Flights;

namespace TravelAssistant.Services.WeatherExternalDataService.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/flights")]
public sealed class FlightsController : ControllerBase
{
    private readonly IFlightStatusClient _flightStatusClient;

    public FlightsController(IFlightStatusClient flightStatusClient) => _flightStatusClient = flightStatusClient;

    [HttpGet("{flightNumber}/status")]
    [ProducesResponseType(typeof(FlightStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<FlightStatusDto>> Status(
        string flightNumber,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
    {
        try
        {
            var dto = await _flightStatusClient.GetByFlightNumberAsync(flightNumber, date, cancellationToken);
            return Ok(dto);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("access key", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = ex.Message });
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

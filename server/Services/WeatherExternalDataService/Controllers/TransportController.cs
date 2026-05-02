using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.WeatherExternalDataService.DTOs.Transport;
using TravelAssistant.Services.WeatherExternalDataService.Services.Transport;

namespace TravelAssistant.Services.WeatherExternalDataService.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/transport")]
public sealed class TransportController : ControllerBase
{
    private readonly ITransportOptionsClient _transportOptionsClient;

    public TransportController(ITransportOptionsClient transportOptionsClient) =>
        _transportOptionsClient = transportOptionsClient;

    [HttpGet("options")]
    [ProducesResponseType(typeof(IReadOnlyList<TransportOptionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<IReadOnlyList<TransportOptionDto>>> Options(
        [FromQuery] double fromLatitude,
        [FromQuery] double fromLongitude,
        [FromQuery] double toLatitude,
        [FromQuery] double toLongitude,
        CancellationToken cancellationToken)
    {
        try
        {
            var options = await _transportOptionsClient.GetOptionsAsync(fromLatitude, fromLongitude, toLatitude, toLongitude, cancellationToken);
            return Ok(options);
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

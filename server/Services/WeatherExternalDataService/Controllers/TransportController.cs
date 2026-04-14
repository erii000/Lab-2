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
    public Task<IReadOnlyList<TransportOptionDto>> Options(
        [FromQuery] double fromLatitude,
        [FromQuery] double fromLongitude,
        [FromQuery] double toLatitude,
        [FromQuery] double toLongitude,
        CancellationToken cancellationToken) =>
        _transportOptionsClient.GetOptionsAsync(fromLatitude, fromLongitude, toLatitude, toLongitude, cancellationToken);
}

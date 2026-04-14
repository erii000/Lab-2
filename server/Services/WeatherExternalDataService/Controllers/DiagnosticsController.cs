using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TravelAssistant.Services.WeatherExternalDataService.Configuration;

namespace TravelAssistant.Services.WeatherExternalDataService.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/diagnostics")]
public sealed class DiagnosticsController : ControllerBase
{
    private readonly IOptions<AviationStackOptions> _aviationStackOptions;

    public DiagnosticsController(IOptions<AviationStackOptions> aviationStackOptions) =>
        _aviationStackOptions = aviationStackOptions;

    [HttpGet("integrations")]
    public IActionResult Integrations()
    {
        var hasAviationKey = !string.IsNullOrWhiteSpace(_aviationStackOptions.Value.AccessKey);
        return Ok(new
        {
            service = "WeatherExternalDataService",
            openMeteo = new { configured = true, note = "No API key required for Open-Meteo." },
            aviationStack = new { accessKeyConfigured = hasAviationKey },
            transport = new { mode = "heuristic", note = "Uber-grade providers require OAuth; estimates are normalized locally." }
        });
    }
}

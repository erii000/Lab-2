using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.ItineraryService.Contracts.Itineraries;
using TravelAssistant.Services.ItineraryService.Services.Interfaces;

namespace TravelAssistant.Services.ItineraryService.Controllers;

[ApiController]
[Route("api/v1/itineraries")]
[Authorize(Roles = "Admin")]
public sealed class ItinerariesController : ControllerBase
{
    private readonly IItinerarySearchService _itinerarySearchService;

    public ItinerariesController(IItinerarySearchService itinerarySearchService)
    {
        _itinerarySearchService = itinerarySearchService;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] ItinerarySearchRequest request, CancellationToken cancellationToken)
    {
        var data = await _itinerarySearchService.SearchAsync(request, cancellationToken);
        return Ok(data);
    }
}

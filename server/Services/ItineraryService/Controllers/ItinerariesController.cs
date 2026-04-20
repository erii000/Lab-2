using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.ItineraryService.Contracts.Itineraries;
using TravelAssistant.Services.ItineraryService.DTOs.Itineraries;
using TravelAssistant.Services.ItineraryService.Security;
using TravelAssistant.Services.ItineraryService.Services.Interfaces;
using TravelAssistant.Services.ItineraryService.Services.ItineraryPlanning;

namespace TravelAssistant.Services.ItineraryService.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public sealed class ItinerariesController : ControllerBase
{
    private readonly IItineraryPlanningService _itineraryPlanningService;
    private readonly IItinerarySearchService _itinerarySearchService;

    public ItinerariesController(
        IItineraryPlanningService itineraryPlanningService,
        IItinerarySearchService itinerarySearchService)
    {
        _itineraryPlanningService = itineraryPlanningService;
        _itinerarySearchService = itinerarySearchService;
    }

    [HttpPost("generate")]
    [ProducesResponseType(typeof(GenerateItineraryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<GenerateItineraryResponse>> Generate(
        [FromBody] GenerateItineraryRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var created = await _itineraryPlanningService.GenerateAsync(userId.Value, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ItineraryDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItineraryDetailResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var dto = await _itineraryPlanningService.GetByIdAsync(id, userId.Value, User.IsAdmin(), cancellationToken);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("user/{userId:int}")]
    [ProducesResponseType(typeof(IReadOnlyList<ItinerarySummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<ItinerarySummaryDto>>> ListForUser(
        int userId,
        CancellationToken cancellationToken)
    {
        var requester = User.GetUserId();
        if (requester is null)
            return Unauthorized();

        if (!User.IsAdmin() && requester.Value != userId)
            return Forbid();

        var list = await _itineraryPlanningService.ListForUserAsync(userId, requester.Value, User.IsAdmin(), cancellationToken);
        return Ok(list);
    }

    [HttpGet("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Search([FromQuery] ItinerarySearchRequest request, CancellationToken cancellationToken)
    {
        var data = await _itinerarySearchService.SearchAsync(request, cancellationToken);
        return Ok(data);
    }
}
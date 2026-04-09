using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Data;

namespace TravelAssistant.Services.ItineraryService.Controllers;

[ApiController]
[Route("api/diagnostics")]
public sealed class DiagnosticsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public DiagnosticsController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("db")]
    public async Task<IActionResult> DbStatus(CancellationToken cancellationToken)
    {
        var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
        if (!canConnect)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "down",
                service = "ItineraryService",
                database = "unreachable"
            });
        }

        var itineraries = await _dbContext.Itineraries.CountAsync(cancellationToken);
        var trips = await _dbContext.Trips.CountAsync(cancellationToken);
        var destinations = await _dbContext.Destinations.CountAsync(cancellationToken);

        return Ok(new
        {
            status = "up",
            service = "ItineraryService",
            database = "connected",
            counts = new { itineraries, trips, destinations }
        });
    }
}
